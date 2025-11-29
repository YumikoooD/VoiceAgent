"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { DownloadIcon, CopyIcon, CheckIcon, ArrowUp } from "lucide-react";
import { GuardrailChip } from "./GuardrailChip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";

export interface TranscriptProps {
  userText: string;
  setUserText: (val: string) => void;
  onSendMessage: () => void;
  canSend: boolean;
  downloadRecording: () => void;
}

function Transcript({
  userText,
  setUserText,
  onSendMessage,
  canSend,
  downloadRecording,
}: TranscriptProps) {
  const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);
  const [justCopied, setJustCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function scrollToBottom() {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    const hasNewMessage = transcriptItems.length > prevLogs.length;
    const hasUpdatedMessage = transcriptItems.some((newItem, index) => {
      const oldItem = prevLogs[index];
      return (
        oldItem &&
        (newItem.title !== oldItem.title || newItem.data !== oldItem.data)
      );
    });

    if (hasNewMessage || hasUpdatedMessage) {
      scrollToBottom();
    }

    setPrevLogs(transcriptItems);
  }, [transcriptItems]);

  useEffect(() => {
    if (canSend && inputRef.current) {
      inputRef.current.focus();
    }
  }, [canSend]);

  const handleCopyTranscript = async () => {
    if (!transcriptRef.current) return;
    try {
      await navigator.clipboard.writeText(transcriptRef.current.innerText);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy transcript:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      {/* Messages Area */}
      <div
        ref={transcriptRef}
        className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth relative"
      >
        {transcriptItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="text-center">
              <p className="text-cyber-300 text-sm">Start the conversation...</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-8 max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {transcriptItems
              .sort((a, b) => a.createdAtMs - b.createdAtMs)
              .map((item) => {
                const {
                  itemId,
                  type,
                  role,
                  data,
                  expanded,
                  timestamp,
                  title = "",
                  isHidden,
                  guardrailResult,
                } = item;

                if (isHidden) return null;

                if (type === "MESSAGE") {
                  const isUser = role === "user";
                  const isBracketedMessage = title.startsWith("[") && title.endsWith("]");
                  
                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col",
                        isUser ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] p-0 bg-transparent", // Minimalist - no background
                          isUser ? "text-right" : "text-left"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-1 opacity-40 text-[10px] uppercase tracking-widest font-medium">
                          <span className={isUser ? "ml-auto" : "mr-auto"}>{timestamp}</span>
                        </div>
                        
                        <div className={cn(
                          "text-lg leading-relaxed",
                          isUser ? "text-white/90" : "text-neon-cyan/90",
                          isBracketedMessage && "italic opacity-50 text-sm"
                        )}>
                          <ReactMarkdown>{title.replace(/^\[|\]$/g, "")}</ReactMarkdown>
                        </div>

                        {guardrailResult && (
                          <div className="mt-2">
                            <GuardrailChip guardrailResult={guardrailResult} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                }

                if (type === "BREADCRUMB") {
                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center my-4"
                    >
                      <div 
                        onClick={() => data && toggleTranscriptItemExpand(itemId)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-mono border transition-colors cursor-pointer",
                          data 
                            ? "bg-cyber-900/50 border-white/10 text-cyber-400 hover:border-neon-cyan/30 hover:text-neon-cyan" 
                            : "bg-transparent border-transparent text-cyber-600"
                        )}
                      >
                        <span className="opacity-50 mr-2">{timestamp}</span>
                        <span className="uppercase tracking-wider">{title}</span>
                      </div>
                      
                      <AnimatePresence>
                        {expanded && data && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="absolute mt-8 w-full max-w-lg bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden z-20 shadow-2xl left-1/2 -translate-x-1/2"
                          >
                            <pre className="text-[10px] p-4 overflow-x-auto font-mono text-cyber-300">
                              {JSON.stringify(data, null, 2)}
                            </pre>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }
                return null;
              })}
          </AnimatePresence>
        </div>
      </div>

      {/* Minimalist Input */}
      <div className="w-full max-w-3xl mx-auto px-4 pb-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 via-neon-cyan/20 to-neon-blue/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <input
            ref={inputRef}
            type="text"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSend) {
                onSendMessage();
              }
            }}
            disabled={!canSend}
            placeholder={canSend ? "Type a message..." : "Waiting for connection..."}
            className="relative w-full bg-black/40 backdrop-blur-xl text-white placeholder-white/30 px-6 py-4 pr-12 rounded-full border border-white/10 focus:border-white/20 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          />
          <button
            onClick={onSendMessage}
            disabled={!canSend || !userText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-200 disabled:opacity-0 disabled:scale-50"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex justify-end gap-4 mt-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button
            onClick={handleCopyTranscript}
            className="text-[10px] uppercase tracking-wider text-white/30 hover:text-white/70 transition-colors flex items-center gap-1"
          >
            {justCopied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
            {justCopied ? "Copied" : "Copy Chat"}
          </button>
          <button
            onClick={downloadRecording}
            className="text-[10px] uppercase tracking-wider text-white/30 hover:text-white/70 transition-colors flex items-center gap-1"
          >
            <DownloadIcon className="w-3 h-3" />
            Download Audio
          </button>
        </div>
      </div>
    </div>
  );
}

export default Transcript;
