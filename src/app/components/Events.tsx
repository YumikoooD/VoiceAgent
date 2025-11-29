"use client";

import React, { useRef, useEffect, useState } from "react";
import { useEvent } from "@/app/contexts/EventContext";
import { LoggedEvent } from "@/app/types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, AlertCircle } from "lucide-react";
import { cn } from "@/app/lib/utils";

export interface EventsProps {
  isExpanded: boolean;
}

function Events({ isExpanded }: EventsProps) {
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
        marginLeft: isExpanded ? "1rem" : 0
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col min-h-0 glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-xl z-10">
        <h2 className="font-semibold text-lg text-white tracking-tight">
          Event Logs
        </h2>
        <span className="text-xs text-cyber-400 font-mono">
          {loggedEvents.length} events
        </span>
      </div>

      <div
        ref={eventLogsContainerRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth"
      >
        <div className="flex flex-col gap-2">
          {loggedEvents.map((log, idx) => {
            const isClient = log.direction === "client";
            const isError =
              log.eventName.toLowerCase().includes("error") ||
              log.eventData?.response?.status_details?.error != null;

            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * (idx % 5) }}
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
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <div className={cn(
                    "p-1.5 rounded-md",
                    isClient ? "bg-neon-purple/10 text-neon-purple" : "bg-neon-emerald/10 text-neon-emerald",
                    isError && "bg-red-500/10 text-red-400"
                  )}>
                    {isError ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : isClient ? (
                      <ArrowUp className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-sm font-medium truncate",
                      isError ? "text-red-400" : "text-cyber-200"
                    )}>
                      {log.eventName}
                    </div>
                    <div className="text-[10px] text-cyber-500 font-mono mt-0.5">
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
                      <pre className="p-3 text-[10px] font-mono text-cyber-300 overflow-x-auto">
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
