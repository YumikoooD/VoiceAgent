"use client";

import React, { useRef, useEffect, useState } from "react";
import { useEvent } from "@/app/contexts/EventContext";
import { LoggedEvent } from "@/app/types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, AlertCircle, X } from "lucide-react";
import { cn } from "@/app/lib/utils";

export interface EventsProps {
  isExpanded: boolean;
  onClose?: () => void;
}

function Events({ isExpanded, onClose }: EventsProps) {
  const [prevEventLogs, setPrevEventLogs] = useState<LoggedEvent[]>([]);
  const eventLogsContainerRef = useRef<HTMLDivElement | null>(null);
  const { loggedEvents, toggleExpand } = useEvent();

  useEffect(() => {
    const hasNewEvent = loggedEvents.length > prevEventLogs.length;
    if (isExpanded && hasNewEvent && eventLogsContainerRef.current) {
      eventLogsContainerRef.current.scrollTop = eventLogsContainerRef.current.scrollHeight;
    }
    setPrevEventLogs(loggedEvents);
  }, [loggedEvents, isExpanded]);

  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isExpanded ? "24rem" : 0, 
        opacity: isExpanded ? 1 : 0,
        x: isExpanded ? 0 : 20
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-4 top-24 bottom-24 flex flex-col glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-50 bg-cyber-900/90 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm text-white tracking-tight">
            Event Logs
          </h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-cyber-400 font-mono">
            {loggedEvents.length}
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 text-cyber-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div
        ref={eventLogsContainerRef}
        className="flex-1 overflow-y-auto p-2 scroll-smooth"
      >
        <div className="flex flex-col gap-1">
          {loggedEvents.map((log, idx) => {
            const isClient = log.direction === "client";
            const isError =
              log.eventName.toLowerCase().includes("error") ||
              log.eventData?.response?.status_details?.error != null;

            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * (idx % 5) }}
                key={`${log.id}-${idx}`}
                className={cn(
                  "group rounded-lg border transition-all duration-200",
                  log.expanded 
                    ? "bg-white/5 border-white/10" 
                    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
                )}
              >
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="flex items-center gap-3 p-2 cursor-pointer"
                >
                  <div className={cn(
                    "p-1 rounded-md shrink-0",
                    isClient ? "bg-neon-purple/10 text-neon-purple" : "bg-neon-emerald/10 text-neon-emerald",
                    isError && "bg-red-500/10 text-red-400"
                  )}>
                    {isError ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : isClient ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-xs font-medium truncate",
                      isError ? "text-red-400" : "text-cyber-200"
                    )}>
                      {log.eventName}
                    </div>
                    <div className="text-[9px] text-cyber-500 font-mono">
                      {log.timestamp}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {log.expanded && log.eventData && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/20"
                    >
                      <pre className="p-2 text-[9px] font-mono text-cyber-300 overflow-x-auto scrollbar-thin">
                        {JSON.stringify(log.eventData, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default Events;
