"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";

// UI components
import Transcript from "./components/Transcript";
import Events from "./components/Events";
import BottomToolbar from "./components/BottomToolbar";
import VoiceVisualizer from "./components/VoiceVisualizer";

// Types
import { SessionStatus } from "@/app/types";
import type { RealtimeAgent } from '@openai/agents/realtime';

// Context providers & hooks
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useRealtimeSession } from "./hooks/useRealtimeSession";
import { createModerationGuardrail } from "@/app/agentConfigs/guardrails";

// Agent configs
import { allAgentSets, defaultAgentSetKey } from "@/app/agentConfigs";
import { customerServiceRetailScenario } from "@/app/agentConfigs/customerServiceRetail";
import { chatSupervisorScenario } from "@/app/agentConfigs/chatSupervisor";
import { customerServiceRetailCompanyName } from "@/app/agentConfigs/customerServiceRetail";
import { chatSupervisorCompanyName } from "@/app/agentConfigs/chatSupervisor";
import { simpleHandoffScenario } from "@/app/agentConfigs/simpleHandoff";

// Map used by connect logic for scenarios defined via the SDK.
const sdkScenarioMap: Record<string, RealtimeAgent[]> = {
  simpleHandoff: simpleHandoffScenario,
  customerServiceRetail: customerServiceRetailScenario,
  chatSupervisor: chatSupervisorScenario,
};

// User-friendly display names for scenarios
const SCENARIO_DISPLAY_NAMES: Record<string, string> = {
  simpleHandoff: 'Simple Handoff Demo',
  customerServiceRetail: 'Customer Service (Retail)',
  chatSupervisor: 'Chat Supervisor (NewTelco)',
};

import useAudioDownload from "./hooks/useAudioDownload";
import { useHandleSessionHistory } from "./hooks/useHandleSessionHistory";
import { useCustomAgents } from "./hooks/useCustomAgents";
import { useVoiceVisualization } from "./hooks/useVoiceVisualization";

function App() {
  const searchParams = useSearchParams()!;
  const urlCodec = searchParams.get("codec") || "opus";

  const { addTranscriptMessage, addTranscriptBreadcrumb } = useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();

  // Load custom agents from the Agent Builder
  const { customAgentSets, isLoaded: customAgentsLoaded } = useCustomAgents();

  // Merge built-in and custom agent sets
  const mergedAgentSets = React.useMemo(() => ({
    ...allAgentSets,
    ...customAgentSets,
  }), [customAgentSets]);

  // Merge SDK scenario maps
  const mergedSdkScenarioMap = React.useMemo(() => ({
    ...sdkScenarioMap,
    ...customAgentSets,
  }), [customAgentSets]);

  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] = useState<RealtimeAgent[] | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const handoffTriggeredRef = useRef(false);

  const sdkAudioElement = React.useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const el = document.createElement('audio');
    el.autoplay = true;
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }, []);

  useEffect(() => {
    if (sdkAudioElement && !audioElementRef.current) {
      audioElementRef.current = sdkAudioElement;
    }
  }, [sdkAudioElement]);

  const {
    connect,
    disconnect,
    sendUserText,
    sendEvent,
    interrupt,
    mute,
  } = useRealtimeSession({
    onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
    onAgentHandoff: (agentName: string) => {
      handoffTriggeredRef.current = true;
      setSelectedAgentName(agentName);
    },
  });

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [isEventsPaneExpanded, setIsEventsPaneExpanded] = useState<boolean>(false);
  const [userText, setUserText] = useState<string>("");
  const [isPTTActive, setIsPTTActive] = useState<boolean>(false);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('audioPlaybackEnabled');
    return stored ? stored === 'true' : true;
  });

  const { startRecording, stopRecording, downloadRecording } = useAudioDownload();
  
  // Voice visualization
  const isVisualizationActive = sessionStatus === "CONNECTED";
  const visualizationData = useVoiceVisualization(isVisualizationActive);

  useHandleSessionHistory();

  useEffect(() => {
    if (!customAgentsLoaded) return;

    let finalAgentConfig = searchParams.get("agentConfig");
    if (!finalAgentConfig || !mergedAgentSets[finalAgentConfig]) {
      finalAgentConfig = defaultAgentSetKey;
      const url = new URL(window.location.toString());
      url.searchParams.set("agentConfig", finalAgentConfig);
      window.location.replace(url.toString());
      return;
    }

    const agents = mergedAgentSets[finalAgentConfig];
    const agentKeyToUse = agents[0]?.name || "";

    setSelectedAgentName(agentKeyToUse);
    setSelectedAgentConfigSet(agents);
  }, [searchParams, customAgentsLoaded, mergedAgentSets]);

  useEffect(() => {
    if (selectedAgentName && sessionStatus === "DISCONNECTED") {
      connectToRealtime();
    }
  }, [selectedAgentName]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED" && selectedAgentConfigSet && selectedAgentName) {
      const currentAgent = selectedAgentConfigSet.find((a) => a.name === selectedAgentName);
      addTranscriptBreadcrumb(`Agent: ${selectedAgentName}`, currentAgent);
      updateSession(!handoffTriggeredRef.current);
      handoffTriggeredRef.current = false;
    }
  }, [selectedAgentConfigSet, selectedAgentName, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      updateSession();
    }
  }, [isPTTActive]);

  const fetchEphemeralKey = async (): Promise<string | null> => {
    logClientEvent({ url: "/session" }, "fetch_session_token_request");
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    logServerEvent(data, "fetch_session_token_response");

    if (!data.client_secret?.value) {
      logClientEvent(data, "error.no_ephemeral_key");
      console.error("No ephemeral key provided by the server");
      setSessionStatus("DISCONNECTED");
      return null;
    }

    return data.client_secret.value;
  };

  const connectToRealtime = async () => {
    const agentSetKey = searchParams.get("agentConfig") || "default";
    if (mergedSdkScenarioMap[agentSetKey]) {
      if (sessionStatus !== "DISCONNECTED") return;
      setSessionStatus("CONNECTING");

      try {
        const EPHEMERAL_KEY = await fetchEphemeralKey();
        if (!EPHEMERAL_KEY) return;

        const reorderedAgents = [...mergedSdkScenarioMap[agentSetKey]];
        const idx = reorderedAgents.findIndex((a) => a.name === selectedAgentName);
        if (idx > 0) {
          const [agent] = reorderedAgents.splice(idx, 1);
          reorderedAgents.unshift(agent);
        }

        const companyName = agentSetKey === 'customerServiceRetail'
          ? customerServiceRetailCompanyName
          : agentSetKey.startsWith('custom_')
          ? agentSetKey.replace('custom_', '')
          : chatSupervisorCompanyName;
        const guardrail = createModerationGuardrail(companyName);

        await connect({
          getEphemeralKey: async () => EPHEMERAL_KEY,
          initialAgents: reorderedAgents,
          audioElement: sdkAudioElement,
          outputGuardrails: [guardrail],
          extraContext: { addTranscriptBreadcrumb },
        });
      } catch (err) {
        console.error("Error connecting via SDK:", err);
        setSessionStatus("DISCONNECTED");
      }
      return;
    }
  };

  const disconnectFromRealtime = () => {
    disconnect();
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);
  };

  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);
    sendEvent({
      type: 'conversation.item.create',
      item: {
        id,
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    });
    sendEvent({ type: 'response.create' });
  };

  const updateSession = (shouldTriggerResponse: boolean = false) => {
    const turnDetection = isPTTActive ? null : {
      type: 'server_vad',
      threshold: 0.9,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
      create_response: true,
    };

    sendEvent({
      type: 'session.update',
      session: { turn_detection: turnDetection },
    });

    if (shouldTriggerResponse) {
      sendSimulatedUserMessage('hi');
    }
  };

  const handleSendTextMessage = () => {
    if (!userText.trim()) return;
    interrupt();
    try {
      sendUserText(userText.trim());
    } catch (err) {
      console.error('Failed to send via SDK', err);
    }
    setUserText("");
  };

  const handleTalkButtonDown = () => {
    if (sessionStatus !== 'CONNECTED') return;
    interrupt();
    setIsPTTUserSpeaking(true);
    sendEvent({ type: 'input_audio_buffer.clear' });
  };

  const handleTalkButtonUp = () => {
    if (sessionStatus !== 'CONNECTED' || !isPTTUserSpeaking) return;
    setIsPTTUserSpeaking(false);
    sendEvent({ type: 'input_audio_buffer.commit' });
    sendEvent({ type: 'response.create' });
  };

  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
    } else {
      connectToRealtime();
    }
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAgentConfig = e.target.value;
    const url = new URL(window.location.toString());
    url.searchParams.set("agentConfig", newAgentConfig);
    window.location.replace(url.toString());
  };


  const handleCodecChange = (newCodec: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set("codec", newCodec);
    window.location.replace(url.toString());
  };

  useEffect(() => {
    const storedPushToTalkUI = localStorage.getItem("pushToTalkUI");
    if (storedPushToTalkUI) setIsPTTActive(storedPushToTalkUI === "true");
    const storedLogsExpanded = localStorage.getItem("logsExpanded");
    if (storedLogsExpanded) setIsEventsPaneExpanded(storedLogsExpanded === "true");
    const storedAudioPlaybackEnabled = localStorage.getItem("audioPlaybackEnabled");
    if (storedAudioPlaybackEnabled) setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === "true");
  }, []);

  useEffect(() => { localStorage.setItem("pushToTalkUI", isPTTActive.toString()); }, [isPTTActive]);
  useEffect(() => { localStorage.setItem("logsExpanded", isEventsPaneExpanded.toString()); }, [isEventsPaneExpanded]);
  useEffect(() => { localStorage.setItem("audioPlaybackEnabled", isAudioPlaybackEnabled.toString()); }, [isAudioPlaybackEnabled]);

  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.muted = false;
        audioElementRef.current.play().catch(err => console.warn("Autoplay blocked:", err));
      } else {
        audioElementRef.current.muted = true;
        audioElementRef.current.pause();
      }
    }
    try { mute(!isAudioPlaybackEnabled); } catch (err) { console.warn('Failed to toggle mute', err); }
  }, [isAudioPlaybackEnabled]);

  useEffect(() => {
    if (sessionStatus === 'CONNECTED') {
      try { mute(!isAudioPlaybackEnabled); } catch (err) { console.warn('mute sync failed', err); }
    }
  }, [sessionStatus, isAudioPlaybackEnabled]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED" && audioElementRef.current?.srcObject) {
      startRecording(audioElementRef.current.srcObject as MediaStream);
    }
    return () => stopRecording();
  }, [sessionStatus]);

  const agentSetKey = searchParams.get("agentConfig") || "default";

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-neon-cyan/30">
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <Image
            src="/openai-logomark.svg"
            alt="Logo"
            width={24}
            height={24}
            className="opacity-80"
          />
          <h1 className="text-sm font-medium tracking-wider uppercase text-white/80">Voice Agent</h1>
        </div>

        {/* Agent Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 border border-white/5">
            <Settings className="w-4 h-4 text-cyber-500" />
            <select
              value={agentSetKey}
              onChange={handleAgentChange}
              className="bg-transparent text-sm text-white/80 font-medium appearance-none cursor-pointer outline-none pr-2 hover:text-white transition-colors"
            >
              {Object.keys(allAgentSets).map((key) => (
                <option key={key} value={key} className="bg-cyber-900 text-white">
                  {SCENARIO_DISPLAY_NAMES[key] || key}
                </option>
              ))}
              {Object.keys(customAgentSets).length > 0 && <option disabled>──────────</option>}
              {Object.keys(customAgentSets).map((key) => (
                <option key={key} value={key} className="bg-cyber-900 text-white">✨ {key.replace('custom_', '')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <Link
            href="/builder"
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full transition-all"
          >
            Agent Builder
          </Link>
        </div>
      </header>

      {/* Main Split View */}
      <main className="flex-1 pt-16 flex relative overflow-hidden">
        
        {/* Left: Visualizer & Hero Area (40%) */}
        <div className="w-[40%] relative flex flex-col items-center justify-center border-r border-white/5 bg-gradient-to-b from-black to-cyber-900/20">
           <div className="absolute inset-0 w-full h-full opacity-30">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[100px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neon-cyan/10 rounded-full blur-[80px]" />
           </div>
           
           <div className="relative z-10 w-full h-[400px]">
             <VoiceVisualizer 
                visualizationData={visualizationData}
                isActive={isVisualizationActive}
              />
           </div>

           <div className="mt-8 text-center">
             <h2 className="text-2xl font-light text-white/90 tracking-tight">
               {sessionStatus === 'CONNECTED' ? 'Agent Active' : 'Ready to Connect'}
             </h2>
             <p className="text-white/40 text-sm mt-2 font-mono uppercase tracking-widest">
               {selectedAgentName}
             </p>
           </div>
        </div>

        {/* Right: Transcript (60%) */}
        <div className="flex-1 flex flex-col relative bg-black/40 backdrop-blur-sm">
          <Transcript
            userText={userText}
            setUserText={setUserText}
            onSendMessage={handleSendTextMessage}
            canSend={sessionStatus === "CONNECTED"}
            downloadRecording={downloadRecording}
          />
        </div>

      </main>

      {/* Overlay: Events Drawer */}
      <AnimatePresence>
        {isEventsPaneExpanded && (
          <Events 
            isExpanded={isEventsPaneExpanded} 
            onClose={() => setIsEventsPaneExpanded(false)} 
          />
        )}
      </AnimatePresence>

      {/* Bottom Toolbar */}
      <BottomToolbar
        sessionStatus={sessionStatus}
        onToggleConnection={onToggleConnection}
        isPTTActive={isPTTActive}
        setIsPTTActive={setIsPTTActive}
        isPTTUserSpeaking={isPTTUserSpeaking}
        handleTalkButtonDown={handleTalkButtonDown}
        handleTalkButtonUp={handleTalkButtonUp}
        isEventsPaneExpanded={isEventsPaneExpanded}
        setIsEventsPaneExpanded={setIsEventsPaneExpanded}
        isAudioPlaybackEnabled={isAudioPlaybackEnabled}
        setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
        codec={urlCodec}
        onCodecChange={handleCodecChange}
      />
    </div>
  );
}

export default App;
