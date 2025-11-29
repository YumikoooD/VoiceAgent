"use client";

import React from "react";
import { SessionStatus } from "@/app/types";
import { motion } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Activity, 
  FileText, 
  Settings,
  Power,
  Phone
} from "lucide-react";
import { cn } from "@/app/lib/utils";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isPTTActive: boolean;
  setIsPTTActive: (val: boolean) => void;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (val: boolean) => void;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
  codec: string;
  onCodecChange: (newCodec: string) => void;
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  codec,
  onCodecChange,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-4 p-3 rounded-2xl bg-cyber-900/80 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/5">
        
        {/* Connection Button */}
        <button
          onClick={onToggleConnection}
          disabled={isConnecting}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg",
            isConnected
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
              : "bg-neon-emerald/10 text-neon-emerald hover:bg-neon-emerald/20 border border-neon-emerald/20",
            isConnecting && "opacity-50 cursor-not-allowed animate-pulse"
          )}
        >
          <Power className="w-4 h-4" />
          <span>
            {isConnected ? "Disconnect" : isConnecting ? "Connecting..." : "Connect"}
          </span>
        </button>

        <div className="w-px h-8 bg-white/10" />

        {/* Controls Group */}
        <div className="flex items-center gap-2">
          {/* PTT Toggle */}
          <button
            onClick={() => setIsPTTActive(!isPTTActive)}
            disabled={!isConnected}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200",
              isPTTActive 
                ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" 
                : "hover:bg-white/10 text-cyber-400",
              !isConnected && "opacity-30 cursor-not-allowed"
            )}
            title="Push to Talk Mode"
          >
            {isPTTActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Talk Button (PTT) */}
          <AnimatePresence>
            {isPTTActive && (
              <motion.button
                initial={{ width: 0, opacity: 0, padding: 0 }}
                animate={{ width: "auto", opacity: 1, padding: "0.625rem 1.5rem" }}
                exit={{ width: 0, opacity: 0, padding: 0 }}
                onMouseDown={handleTalkButtonDown}
                onMouseUp={handleTalkButtonUp}
                onTouchStart={handleTalkButtonDown}
                onTouchEnd={handleTalkButtonUp}
                disabled={!isPTTActive}
                className={cn(
                  "whitespace-nowrap rounded-xl font-medium border transition-all duration-100 active:scale-95",
                  isPTTUserSpeaking
                    ? "bg-neon-purple text-white border-neon-purple shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                    : "bg-neon-purple/10 text-neon-purple border-neon-purple/30 hover:bg-neon-purple/20"
                )}
              >
                Hold to Talk
              </motion.button>
            )}
          </AnimatePresence>

          {/* Audio Playback Toggle */}
          <button
            onClick={() => setIsAudioPlaybackEnabled(!isAudioPlaybackEnabled)}
            disabled={!isConnected}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200",
              isAudioPlaybackEnabled 
                ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30" 
                : "hover:bg-white/10 text-cyber-400",
              !isConnected && "opacity-30 cursor-not-allowed"
            )}
            title="Toggle Audio Playback"
          >
            {isAudioPlaybackEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        <div className="w-px h-8 bg-white/10" />

        {/* Logs Toggle */}
        <button
          onClick={() => setIsEventsPaneExpanded(!isEventsPaneExpanded)}
          className={cn(
            "p-2.5 rounded-xl transition-all duration-200",
            isEventsPaneExpanded 
              ? "bg-white/10 text-white border border-white/20" 
              : "hover:bg-white/5 text-cyber-400"
          )}
          title="Toggle Logs"
        >
          <FileText className="w-5 h-5" />
        </button>

        {/* Codec Selector */}
        <div className="relative group">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-xs text-white whitespace-nowrap pointer-events-none">
            Audio Codec
          </div>
          <select
            value={codec}
            onChange={(e) => onCodecChange(e.target.value)}
            className="bg-transparent text-xs text-cyber-400 font-mono border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-white/30 hover:border-white/20 cursor-pointer appearance-none"
          >
            <option value="opus" className="bg-cyber-900">OPUS (48k)</option>
            <option value="pcmu" className="bg-cyber-900">PCMU (8k)</option>
            <option value="pcma" className="bg-cyber-900">PCMA (8k)</option>
          </select>
        </div>

      </div>
    </motion.div>
  );
}

import { AnimatePresence } from "framer-motion";

export default BottomToolbar;
