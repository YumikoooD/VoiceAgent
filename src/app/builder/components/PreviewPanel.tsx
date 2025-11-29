'use client';

import React, { useState } from 'react';
import { AgentConfig, VOICE_OPTIONS } from '../types';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Code, 
  FileJson, 
  Check, 
  Copy, 
  Pencil, 
  Mic, 
  Wrench, 
  GitCompare, 
  Play
} from 'lucide-react';
import { useVoiceVisualization } from '../../hooks/useVoiceVisualization';
import VoiceVisualizer from '../../components/VoiceVisualizer';

interface PreviewPanelProps {
  agent: AgentConfig;
  onClose: () => void;
  onEdit: () => void;
  onExport: () => void;
}

export default function PreviewPanel({ agent, onClose, onEdit, onExport }: PreviewPanelProps) {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const voiceInfo = VOICE_OPTIONS.find(v => v.value === agent.voice);

  // Fake visualizer state for preview
  const visualizationData = {
    frequencyData: new Uint8Array([100, 150, 200, 180, 120, 80]),
    timeDomainData: new Uint8Array(128),
    volume: 0.5
  };

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

  const handleCopy = () => {
    navigator.clipboard.writeText(showJson ? jsonPreview : codePreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine launch URL
  const launchKey = agent.id.startsWith('builtin_') 
    ? agent.id.replace('builtin_', '') 
    : `custom_${agent.name}`;
  const launchUrl = `/chat?agentConfig=${encodeURIComponent(launchKey)}`;

  return (
    <div className="flex flex-col bg-black">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h2 className="text-xl font-light text-white flex items-center gap-3">
              {agent.name}
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs font-mono">
                Preview
              </span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={launchUrl}
            className="px-6 py-2 bg-neon-cyan hover:bg-cyan-400 text-black rounded-full text-sm font-bold transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transform duration-200"
          >
            <Play className="w-4 h-4 fill-current" />
            Try Agent
          </a>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button
            onClick={onExport}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Export JSON"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title={agent.isReadOnly ? "Clone & Edit" : "Edit"}
          >
            {agent.isReadOnly ? <Copy className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Visualizer & Stats */}
          <div className="space-y-6">
            {/* Hero Card */}
            <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden relative h-[300px] flex flex-col items-center justify-center">
               <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-neon-purple/30 rounded-full blur-[80px]" />
               </div>
               
               {/* Live Visualizer Preview */}
               <div className="relative z-10 w-full h-full flex items-center justify-center scale-125">
                 <VoiceVisualizer 
                    visualizationData={visualizationData}
                    isActive={true}
                  />
               </div>

               <div className="absolute bottom-6 left-0 right-0 text-center z-20">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs text-white/80">
                   <Mic className="w-3 h-3 text-neon-cyan" />
                   {voiceInfo?.label || agent.voice}
                 </div>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Voice</p>
                <p className="text-sm font-medium text-white mt-1">{voiceInfo?.label}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Tools</p>
                <p className="text-sm font-medium text-white mt-1">{agent.tools.length} Active</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <GitCompare className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Handoffs</p>
                <p className="text-sm font-medium text-white mt-1">{agent.handoffs.length} Connected</p>
              </div>
            </div>

            {/* Handoff Description */}
             <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h3 className="text-sm font-medium text-white mb-2">Handoff Behavior</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {agent.handoffDescription || "No handoff description provided."}
                </p>
             </div>
          </div>

          {/* Right Column: Details & Code */}
          <div className="space-y-6">
            
            {/* Code Viewer */}
            <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[500px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg">
                  <button
                    onClick={() => setShowJson(false)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      !showJson ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    TypeScript
                  </button>
                  <button
                    onClick={() => setShowJson(true)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      showJson ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    JSON
                  </button>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex-1 overflow-auto custom-scrollbar">
                <pre className="p-4 text-xs font-mono text-white/70 leading-relaxed">
                  {showJson ? jsonPreview : codePreview}
                </pre>
              </div>
            </div>

            {/* Instructions Preview */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-white mb-3">Instructions Preview</h3>
              <div className="prose prose-invert prose-sm max-w-none max-h-48 overflow-y-auto custom-scrollbar pr-2">
                <pre className="whitespace-pre-wrap font-sans text-white/60 text-sm">
                  {agent.instructions || 'No instructions defined'}
                </pre>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
