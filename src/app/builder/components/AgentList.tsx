'use client';

import React from 'react';
import { AgentConfig, VOICE_OPTIONS } from '../types';

interface AgentListProps {
  agents: AgentConfig[];
  onEdit: (agent: AgentConfig) => void;
  onDelete: (agentId: string) => void;
  onPreview: (agent: AgentConfig) => void;
  onCreateNew: () => void;
}

export default function AgentList({ agents, onEdit, onDelete, onPreview, onCreateNew }: AgentListProps) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-6">🤖</div>
        <h2 className="text-2xl font-bold text-white mb-2">No Agents Yet</h2>
        <p className="text-slate-400 mb-6 text-center max-w-md">
          Create your first voice agent to get started. Define its personality, tools, and capabilities.
        </p>
        <button
          onClick={onCreateNew}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
        >
          Create Your First Agent
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Your Agents</h2>
        <p className="text-slate-400">Manage and configure your voice agents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
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
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

function AgentCard({ agent, onEdit, onDelete, onPreview }: AgentCardProps) {
  const voiceInfo = VOICE_OPTIONS.find(v => v.value === agent.voice);
  const toolCount = agent.tools.length;
  const handoffCount = agent.handoffs.length;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{agent.name || 'Untitled Agent'}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
              {voiceInfo?.label || agent.voice}
            </span>
            {toolCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded-full">
                {toolCount} tool{toolCount !== 1 ? 's' : ''}
              </span>
            )}
            {handoffCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded-full">
                {handoffCount} handoff{handoffCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {agent.handoffDescription && (
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {agent.handoffDescription}
        </p>
      )}

      {agent.instructions && (
        <p className="text-slate-500 text-xs mb-4 line-clamp-2 font-mono bg-slate-900/50 p-2 rounded">
          {agent.instructions.slice(0, 150)}...
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
        <span className="text-xs text-slate-500">
          Updated {new Date(agent.updatedAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

