"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { DownloadIcon, CopyIcon, CheckIcon } from "lucide-react";
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
    <div className="flex flex-col flex-1 min-h-0 glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-xl z-10">
        <h2 className="font-semibold text-lg text-white tracking-tight">
          Transcript
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopyTranscript}
            className="p-2 rounded-lg hover:bg-white/10 text-cyber-300 transition-all duration-200 group relative"
            title="Copy Transcript"
          >
            {justCopied ? (
              <CheckIcon className="w-4 h-4 text-neon-emerald" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={downloadRecording}
            className="p-2 rounded-lg hover:bg-white/10 text-cyber-300 transition-all duration-200"
            title="Download Audio"
          >
            <DownloadIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={transcriptRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth relative"
      >
        <div className="flex flex-col gap-6 pb-4">
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
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "flex flex-col",
                        isUser ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl p-4 shadow-lg backdrop-blur-sm border border-white/5 transition-all duration-300",
                          isUser
                            ? "bg-gradient-to-br from-neon-purple/20 to-blue-600/20 text-white rounded-tr-none"
                            : "bg-cyber-800/80 text-cyber-100 rounded-tl-none hover:bg-cyber-800/90"
                        )}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 opacity-60 text-[10px] uppercase tracking-wider font-medium">
                          <span>{isUser ? "You" : "Agent"}</span>
                          <span>{timestamp}</span>
                        </div>
                        
                        <div className={cn(
                          "prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 max-w-none",
                          isBracketedMessage && "italic opacity-70"
                        )}>
                          <ReactMarkdown>{title.replace(/^\[|\]$/g, "")}</ReactMarkdown>
                        </div>

                        {guardrailResult && (
                          <div className="mt-3 pt-3 border-t border-white/10">
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
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-1 pl-4 border-l-2 border-white/10 my-2 group"
                    >
                      <div 
                        onClick={() => data && toggleTranscriptItemExpand(itemId)}
                        className={cn(
                          "flex items-center gap-2 text-xs font-mono transition-colors",
                          data ? "cursor-pointer text-cyber-400 hover:text-neon-cyan" : "text-cyber-500"
                        )}
                      >
                        <span className="opacity-50">{timestamp}</span>
                        <span className="font-medium">{title}</span>
                        {data && (
                          <span className={cn(
                            "transform transition-transform duration-200 text-[10px]",
                            expanded ? "rotate-90" : "rotate-0"
                          )}>▶</span>
                        )}
                      </div>
                      
                      <AnimatePresence>
                        {expanded && data && (
                          <motion.pre
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-[10px] bg-black/30 p-3 rounded-lg overflow-x-auto font-mono text-cyber-300 mt-1 border border-white/5"
                          >
                            {JSON.stringify(data, null, 2)}
                          </motion.pre>
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

      {/* Input Area */}
      <div className="p-4 bg-white/5 backdrop-blur-md border-t border-white/5">
        <div className="relative group">
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
            placeholder={canSend ? "Type a message..." : "Connecting..."}
            className="w-full bg-cyber-900/50 text-white placeholder-cyber-400/50 px-5 py-4 pr-12 rounded-full border border-white/10 focus:border-neon-purple/50 focus:ring-2 focus:ring-neon-purple/20 focus:outline-none transition-all duration-300 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={onSendMessage}
            disabled={!canSend || !userText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full text-white shadow-lg hover:shadow-neon-cyan/30 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-0 disabled:scale-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Transcript;
