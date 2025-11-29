'use client';

import React from 'react';
import { AgentConfig, VOICE_OPTIONS } from '../types';
import { motion } from 'framer-motion';
import { 
  Edit2, 
  Trash2, 
  Mic, 
  Wrench, 
  GitCompare, 
  Plus,
  Clock,
  ArrowLeft,
  Copy,
  Lock,
  Sparkles
} from 'lucide-react';

interface AgentListProps {
  agents: AgentConfig[];
  onEdit: (agent: AgentConfig) => void;
  onDelete: (agentId: string) => void;
  onPreview: (agent: AgentConfig) => void;
  onCreateNew: () => void;
  onAIGenerate?: () => void;
}

export default function AgentList({ agents, onEdit, onDelete, onPreview, onCreateNew, onAIGenerate }: AgentListProps) {
  // Even when empty, we render the grid with the action cards
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AI Generate Card */}
        {onAIGenerate && (
          <motion.button
            onClick={onAIGenerate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border border-neon-purple/20 hover:border-neon-cyan/50 bg-gradient-to-br from-neon-purple/5 to-neon-cyan/5 hover:from-neon-purple/10 hover:to-neon-cyan/10 transition-all duration-300 min-h-[320px] overflow-hidden text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-purple/20 rounded-full blur-3xl group-hover:bg-neon-cyan/20 transition-colors" />
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 group-hover:from-neon-purple/30 group-hover:to-neon-cyan/30 flex items-center justify-center mb-6 transition-all border border-neon-purple/20 group-hover:border-neon-cyan/40 shadow-[0_0_30px_-10px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)]">
                <Sparkles className="w-8 h-8 text-neon-cyan group-hover:rotate-12 transition-transform" />
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-white font-medium text-lg mb-2 group-hover:text-white transition-colors">AI Generate</span>
                <span className="text-white/40 text-xs font-medium tracking-wide">Describe & create instantly</span>
              </div>
            </div>
          </motion.button>
        )}

        {/* Create Manually Card */}
        <motion.button
          onClick={onCreateNew}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-white/10 hover:border-white/30 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all duration-300 min-h-[320px] text-center"
        >
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
            <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center mb-6 transition-colors border border-white/5 group-hover:border-white/10">
              <Plus className="w-8 h-8 text-white/40 group-hover:text-white/80 transition-colors stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-white/60 font-medium text-lg mb-2 group-hover:text-white transition-colors">Create Manually</span>
              <span className="text-white/30 text-xs font-medium tracking-wide">Full control over config</span>
            </div>
          </div>
        </motion.button>

        {/* Agent Cards (only if they exist) */}
        {agents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            index={index}
            onEdit={() => onEdit(agent)}
            onDelete={() => onDelete(agent.id)}
            onPreview={() => onPreview(agent)}
          />
        ))}
      </div>
    </div>
  );
}

interface AgentCardProps {
  agent: AgentConfig;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

function AgentCard({ agent, index, onEdit, onDelete, onPreview }: AgentCardProps) {
  const voiceInfo = VOICE_OPTIONS.find(v => v.value === agent.voice);
  
  // Extract summary from handoffDescription or instructions
  const summary = agent.handoffDescription 
    ? agent.handoffDescription 
    : agent.instructions 
      ? agent.instructions.split('\n').find(line => line.trim().length > 0 && !line.startsWith('#')) || "No description available."
      : "No description available.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-[#0a0a0a] hover:bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-white/10 hover:-translate-y-1 min-h-[320px] flex flex-col relative overflow-hidden"
    >
      {/* Top Actions (Absolute) */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
         <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-white/20 text-white/60 hover:text-white transition-colors border border-white/10"
          title={agent.isReadOnly ? "Clone & Edit" : "Edit"}
        >
          {agent.isReadOnly ? <Copy className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
        </button>
        {!agent.isReadOnly && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-white/20 text-white/60 hover:text-red-400 transition-colors border border-white/10"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Identity Section */}
      <div className="mb-6 relative">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
            agent.isReadOnly 
              ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/20 text-purple-200' 
              : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white'
          }`}>
             <span className="text-xl font-light">
               {agent.name.charAt(0).toUpperCase()}
             </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white tracking-tight flex items-center gap-2">
              {agent.name}
              {agent.isReadOnly && (
                <Lock className="w-3 h-3 text-white/20" />
              )}
            </h3>
            <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3" />
                {voiceInfo?.label || agent.voice}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1">
                <GitCompare className="w-3 h-3" />
                {agent.handoffs.length} Handoffs
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/60 leading-relaxed line-clamp-3 min-h-[4.5em]">
          {summary}
        </p>
      </div>

      {/* Capabilities (Tools) */}
      <div className="flex-1 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="w-3.5 h-3.5 text-neon-cyan/80" />
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Capabilities</span>
        </div>
        <div className="flex flex-wrap gap-2 content-start h-[80px] overflow-hidden mask-image-fade-bottom">
          {agent.tools.length > 0 ? (
            agent.tools.slice(0, 6).map((tool) => (
              <span 
                key={tool.id} 
                className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/70 font-mono hover:bg-white/10 transition-colors"
              >
                {tool.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-white/20 italic px-1">No tools configured</span>
          )}
          {agent.tools.length > 6 && (
            <span className="px-2 py-1 rounded-md text-[10px] text-white/40">
              +{agent.tools.length - 6} more
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-mono uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            {new Date(agent.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
         </div>
         
         <button
          onClick={onPreview}
          className="flex items-center gap-2 text-xs font-medium text-white/40 hover:text-white transition-colors group/btn"
        >
          View Details
          <ArrowLeft className="w-3 h-3 rotate-180 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
