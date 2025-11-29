'use client';

import React, { useState } from 'react';
import { AgentConfig, VOICE_OPTIONS } from '../types';

interface PreviewPanelProps {
  agent: AgentConfig;
  onClose: () => void;
  onEdit: () => void;
  onExport: () => void;
}

export default function PreviewPanel({ agent, onClose, onEdit, onExport }: PreviewPanelProps) {
  const [showJson, setShowJson] = useState(false);
  const voiceInfo = VOICE_OPTIONS.find(v => v.value === agent.voice);

  // Generate the TypeScript code for this agent
  const generateCode = () => {
    const toolsCode = agent.tools.map(tool => {
      const paramsCode = tool.parameters.length > 0
        ? `{
        type: 'object',
        properties: {
${tool.parameters.map(p => `          ${p.name}: {
            type: '${p.type}',
            description: '${p.description.replace(/'/g, "\\'")}'
          }`).join(',\n')}
        },
        required: [${tool.parameters.filter(p => p.required).map(p => `'${p.name}'`).join(', ')}],
        additionalProperties: false
      }`
        : `{
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      }`;

      return `    tool({
      name: '${tool.name}',
      description: '${tool.description.replace(/'/g, "\\'")}',
      parameters: ${paramsCode},
      execute: async (input: any) => {
        // TODO: Implement tool logic
        return { success: true };
      }
    })`;
    }).join(',\n');

    const handoffsCode = agent.handoffs.length > 0
      ? `handoffs: [/* Add agent references here */],`
      : 'handoffs: [],';

    return `import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const ${agent.name}Agent = new RealtimeAgent({
  name: '${agent.name}',
  voice: '${agent.voice}',
  handoffDescription: '${agent.handoffDescription.replace(/'/g, "\\'")}',
  instructions: \`
${agent.instructions}
\`,
  tools: [
${toolsCode}
  ],
  ${handoffsCode}
});

export const ${agent.name}Scenario = [${agent.name}Agent];
export default ${agent.name}Scenario;
`;
  };

  const jsonPreview = JSON.stringify(agent, null, 2);
  const codePreview = generateCode();

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-xl font-semibold text-white">
            Preview: {agent.name}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onExport}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            Edit Agent
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Agent Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="text-sm text-slate-400 mb-1">Voice</h3>
            <p className="text-white font-medium">{voiceInfo?.label}</p>
            <p className="text-sm text-slate-400">{voiceInfo?.description}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="text-sm text-slate-400 mb-1">Tools</h3>
            <p className="text-white font-medium">{agent.tools.length} defined</p>
            {agent.tools.length > 0 && (
              <p className="text-sm text-slate-400">
                {agent.tools.map(t => t.name).join(', ')}
              </p>
            )}
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="text-sm text-slate-400 mb-1">Handoffs</h3>
            <p className="text-white font-medium">{agent.handoffs.length} configured</p>
          </div>
        </div>

        {/* Handoff Description */}
        {agent.handoffDescription && (
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Handoff Description</h3>
            <p className="text-slate-400 bg-slate-900/50 rounded-lg p-4">
              {agent.handoffDescription}
            </p>
          </div>
        )}

        {/* Instructions Preview */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-2">Instructions</h3>
          <pre className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
            {agent.instructions || 'No instructions defined'}
          </pre>
        </div>

        {/* Tools Preview */}
        {agent.tools.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Tools</h3>
            <div className="space-y-3">
              {agent.tools.map(tool => (
                <div key={tool.id} className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{tool.name}</h4>
                    {tool.parameters.length > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                        {tool.parameters.length} params
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{tool.description}</p>
                  {tool.parameters.length > 0 && (
                    <div className="text-xs font-mono bg-slate-800/50 rounded p-2">
                      {tool.parameters.map(p => (
                        <div key={p.name} className="flex items-center gap-2">
                          <span className="text-emerald-400">{p.name}</span>
                          <span className="text-slate-500">:</span>
                          <span className="text-blue-400">{p.type}</span>
                          {p.required && <span className="text-red-400 text-[10px]">required</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code/JSON Toggle */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setShowJson(false)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                !showJson
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TypeScript Code
            </button>
            <button
              onClick={() => setShowJson(true)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showJson
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              JSON
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                navigator.clipboard.writeText(showJson ? jsonPreview : codePreview);
              }}
              className="absolute top-3 right-3 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
            >
              Copy
            </button>
            <pre className="text-xs text-slate-300 bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto font-mono">
              {showJson ? jsonPreview : codePreview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

