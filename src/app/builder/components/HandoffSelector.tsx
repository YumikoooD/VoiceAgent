'use client';

import React from 'react';
import { AgentConfig } from '../types';

interface HandoffSelectorProps {
  selectedHandoffs: string[];
  availableAgents: AgentConfig[];
  onChange: (handoffs: string[]) => void;
}

export default function HandoffSelector({ selectedHandoffs, availableAgents, onChange }: HandoffSelectorProps) {
  const toggleHandoff = (agentId: string) => {
    if (selectedHandoffs.includes(agentId)) {
      onChange(selectedHandoffs.filter(id => id !== agentId));
    } else {
      onChange([...selectedHandoffs, agentId]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-white">Agent Handoffs</h3>
        <p className="text-sm text-slate-400">
          Select which agents this agent can transfer conversations to
        </p>
      </div>

      {availableAgents.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-lg border border-dashed border-slate-600">
          <div className="text-4xl mb-3">🔗</div>
          <p className="text-slate-400 mb-2">No other agents available</p>
          <p className="text-sm text-slate-500">
            Create more agents to enable handoffs between them
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {availableAgents.map(agent => {
            const isSelected = selectedHandoffs.includes(agent.id);
            
            return (
              <div
                key={agent.id}
                onClick={() => toggleHandoff(agent.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-500'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{agent.name}</h4>
                      {agent.handoffDescription && (
                        <p className="text-sm text-slate-400 mt-0.5">{agent.handoffDescription}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                      {agent.voice}
                    </span>
                    {agent.tools.length > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded-full">
                        {agent.tools.length} tools
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Handoff Flow Visualization */}
      {selectedHandoffs.length > 0 && (
        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Handoff Flow</h4>
          <div className="flex items-center flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm border border-emerald-500/30">
              This Agent
            </span>
            <span className="text-slate-500">→</span>
            {selectedHandoffs.map((handoffId, index) => {
              const agent = availableAgents.find(a => a.id === handoffId);
              return (
                <React.Fragment key={handoffId}>
                  {index > 0 && <span className="text-slate-500">/</span>}
                  <span className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30">
                    {agent?.name || 'Unknown'}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

