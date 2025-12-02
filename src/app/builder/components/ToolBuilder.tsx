'use client';

import React, { useState } from 'react';
import { ToolConfig, ToolParameter, PARAMETER_TYPES, createEmptyParameter } from '../types';
import { ChevronRight, X, Plus, Link, Globe, Info, HelpCircle } from 'lucide-react';

interface ToolBuilderProps {
  tool: ToolConfig;
  index: number;
  errors: Record<string, string>;
  onChange: (tool: ToolConfig) => void;
  onDelete: () => void;
}

export default function ToolBuilder({ tool, index, errors, onChange, onDelete }: ToolBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showWebhookHelp, setShowWebhookHelp] = useState(false);


  const updateTool = (updates: Partial<ToolConfig>) => {
    onChange({ ...tool, ...updates });
  };

  const addParameter = () => {
    updateTool({
      parameters: [...tool.parameters, createEmptyParameter()],
    });
  };

  const updateParameter = (paramIndex: number, updates: Partial<ToolParameter>) => {
    const newParams = [...tool.parameters];
    newParams[paramIndex] = { ...newParams[paramIndex], ...updates };
    updateTool({ parameters: newParams });
  };

  const deleteParameter = (paramIndex: number) => {
    updateTool({
      parameters: tool.parameters.filter((_, i) => i !== paramIndex),
    });
  };

  const addHeader = () => {
    const currentHeaders = tool.webhookHeaders || {};
    let key = 'New-Header';
    let counter = 1;
    while (key in currentHeaders) {
      key = `New-Header-${counter}`;
      counter++;
    }
    updateTool({
      webhookHeaders: {
        ...currentHeaders,
        [key]: ''
      }
    });
  };

  const updateHeaderKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;
    const currentHeaders = tool.webhookHeaders || {};
    const value = currentHeaders[oldKey];
    
    // Construct new object preserving other entries order roughly
    const newHeaders: Record<string, string> = {};
    Object.keys(currentHeaders).forEach(k => {
      if (k === oldKey) {
        newHeaders[newKey] = value;
      } else {
        newHeaders[k] = currentHeaders[k];
      }
    });
    
    updateTool({ webhookHeaders: newHeaders });
  };

  const updateHeaderValue = (key: string, value: string) => {
    const currentHeaders = tool.webhookHeaders || {};
    updateTool({
      webhookHeaders: {
        ...currentHeaders,
        [key]: value
      }
    });
  };

  const deleteHeader = (keyToDelete: string) => {
    const currentHeaders = tool.webhookHeaders || {};
    const newHeaders = { ...currentHeaders };
    delete newHeaders[keyToDelete];
    updateTool({ webhookHeaders: newHeaders });
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden transition-colors hover:border-white/20">
      {/* Tool Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <ChevronRight 
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
          />
          <span className="text-white font-medium text-sm tracking-wide">
            {tool.name || `Tool ${index + 1}`}
          </span>
          {tool.parameters.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white/60 rounded-full font-mono">
              {tool.parameters.length} param{tool.parameters.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-white/20 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tool Content */}
      {isExpanded && (
        <div className="p-5 space-y-6 border-t border-white/5">
          {/* Tool Name */}
          <div>
            <label className="block text-xs font-light text-white/40 mb-2 uppercase tracking-wider">
              Tool Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={tool.name}
              onChange={(e) => updateTool({ name: e.target.value })}
              placeholder="e.g., search_products"
              className={`w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all font-mono ${
                errors[`tool_${index}_name`] ? 'border-red-500/50' : 'border-white/10'
              }`}
            />
            {errors[`tool_${index}_name`] && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors[`tool_${index}_name`]}
              </p>
            )}
          </div>

          {/* Tool Description */}
          <div>
            <label className="block text-xs font-light text-white/40 mb-2 uppercase tracking-wider">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={tool.description}
              onChange={(e) => updateTool({ description: e.target.value })}
              placeholder="Describe what this tool does and when it should be used..."
              rows={2}
              className={`w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all resize-none ${
                errors[`tool_${index}_description`] ? 'border-red-500/50' : 'border-white/10'
              }`}
            />
            {errors[`tool_${index}_description`] && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors[`tool_${index}_description`]}
              </p>
            )}
          </div>

          {/* Parameters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-light text-white/40 uppercase tracking-wider">
                Parameters
              </label>
              <button
                onClick={addParameter}
                className="flex items-center gap-1.5 text-xs font-medium text-neon-cyan hover:text-neon-cyan/80 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Parameter
              </button>
            </div>

            {tool.parameters.length === 0 ? (
              <div className="text-center py-8 bg-white/[0.02] rounded-lg border border-dashed border-white/10">
                <p className="text-xs text-white/30">No parameters defined</p>
                <button
                  onClick={addParameter}
                  className="mt-2 text-xs text-neon-cyan hover:underline"
                >
                  Add a parameter
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tool.parameters.map((param, paramIndex) => (
                  <ParameterRow
                    key={paramIndex}
                    parameter={param}
                    onChange={(updates) => updateParameter(paramIndex, updates)}
                    onDelete={() => deleteParameter(paramIndex)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Webhook Configuration - Only show for custom tools (not gmail_ or calendar_) */}
          {!tool.name.startsWith('gmail_') && !tool.name.startsWith('calendar_') && (
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-neon-purple" />
                  <label className="text-xs font-light text-white/60 uppercase tracking-wider">
                    External API Integration
                  </label>
                  <span className="text-[10px] px-2 py-0.5 bg-neon-purple/10 text-neon-purple rounded-full">
                    Optional
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWebhookHelp(!showWebhookHelp)}
                  className={`p-1 rounded-full transition-colors ${showWebhookHelp ? 'bg-neon-purple/20 text-neon-purple' : 'text-white/20 hover:text-white/60'}`}
                  title="How webhooks work"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4 p-4 bg-white/[0.02] rounded-lg border border-white/5">
                {showWebhookHelp && (
                  <div className="mb-6 p-4 bg-neon-purple/5 border border-neon-purple/10 rounded-lg text-xs text-white/60 space-y-3">
                    <div className="flex items-start gap-3">
                      <Info className="w-4 h-4 text-neon-purple mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white mb-2 font-medium">How Webhooks Work</p>
                        <p className="mb-2">When the agent calls this tool, we'll send a request to your external API.</p>
                        <ul className="list-disc pl-4 space-y-1 text-white/50">
                          <li><strong>GET requests:</strong> Tool parameters are sent as URL query parameters.</li>
                          <li><strong>POST/PUT requests:</strong> Tool parameters are sent in the JSON body.</li>
                          <li><strong>Headers:</strong> Use these for API keys (e.g., <code className="text-neon-cyan">Authorization: Bearer key</code>).</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Webhook URL */}
                <div>
                  <label className="block text-xs font-light text-white/40 mb-2">
                    Endpoint URL
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        type="url"
                        value={tool.webhookUrl || ''}
                        onChange={(e) => updateTool({ webhookUrl: e.target.value })}
                        placeholder="https://api.your-service.com/v1/resource"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-neon-purple/50 focus:bg-black/60 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <p className="mt-1.5 text-[10px] text-white/30">
                    Must be a public HTTPS URL. Localhost URLs won't work unless tunneled (e.g. ngrok).
                  </p>
                </div>

                {/* HTTP Method */}
                <div>
                  <label className="block text-xs font-light text-white/40 mb-2">
                    Method
                  </label>
                  <div className="flex gap-2">
                    {(['GET', 'POST', 'PUT', 'DELETE'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => updateTool({ webhookMethod: method })}
                        className={`px-4 py-2 text-xs font-mono rounded-lg border transition-all ${
                          (tool.webhookMethod || 'POST') === method
                            ? 'bg-neon-purple/20 border-neon-purple/50 text-neon-purple'
                            : 'bg-black/40 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Headers Configuration */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-light text-white/40">
                      Authentication & Headers
                    </label>
                    <button
                      onClick={addHeader}
                      className="text-[10px] text-neon-cyan hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Header
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(tool.webhookHeaders || {}).map(([key, value], i) => (
                      <div key={i} className="flex gap-2 group">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => updateHeaderKey(key, e.target.value)}
                          placeholder="e.g. Authorization"
                          className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-md text-white text-xs font-mono focus:outline-none focus:border-neon-purple/50 placeholder-white/20"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateHeaderValue(key, e.target.value)}
                          placeholder="e.g. Bearer sk-..."
                          className="flex-[2] px-3 py-2 bg-black/40 border border-white/10 rounded-md text-white text-xs font-mono focus:outline-none focus:border-neon-purple/50 placeholder-white/20"
                        />
                        <button
                          onClick={() => deleteHeader(key)}
                          className="p-2 text-white/20 hover:text-red-400 hover:bg-white/5 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {Object.keys(tool.webhookHeaders || {}).length === 0 && (
                      <div className="text-xs text-white/20 italic px-2 py-3 bg-black/20 rounded border border-dashed border-white/5 text-center">
                        No custom headers (like API keys) configured.
                      </div>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                {tool.webhookUrl && (
                  <div className="flex items-center gap-2 pt-2 bg-green-500/5 border border-green-500/10 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                    <span className="text-xs text-green-400">
                      <strong>Active:</strong> Agent will call {tool.webhookUrl}
                    </span>
                  </div>
                )}
                
                {!tool.webhookUrl && (
                  <div className="flex items-center gap-2 pt-2 bg-white/5 border border-white/5 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-400/50 rounded-full flex-shrink-0" />
                    <span className="text-xs text-white/40">
                      <strong>No URL configured.</strong> Tool will return a success message without calling any API.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ParameterRowProps {
  parameter: ToolParameter;
  onChange: (updates: Partial<ToolParameter>) => void;
  onDelete: () => void;
}

function ParameterRow({ parameter, onChange, onDelete }: ParameterRowProps) {
  return (
    <div className="grid grid-cols-[1fr_120px_2fr_auto] gap-3 items-start p-3 bg-white/[0.03] rounded-lg border border-white/5 hover:border-white/10 transition-colors">
      {/* Parameter Name */}
      <input
        type="text"
        value={parameter.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="name"
        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-black/60 font-mono"
      />

      {/* Parameter Type */}
      <div className="relative">
        <select
          value={parameter.type}
          onChange={(e) => onChange({ type: e.target.value as ToolParameter['type'] })}
          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-white text-xs focus:outline-none focus:border-white/20 focus:bg-black/60 appearance-none cursor-pointer"
        >
          {PARAMETER_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronRight className="w-3 h-3 text-white/20 rotate-90" />
        </div>
      </div>

      {/* Description */}
      <input
        type="text"
        value={parameter.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Description"
        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-black/60"
      />

      {/* Actions */}
      <div className="flex items-center gap-3 h-full pt-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            parameter.required 
              ? 'bg-neon-cyan border-neon-cyan' 
              : 'bg-transparent border-white/20 group-hover:border-white/40'
          }`}>
            {parameter.required && <div className="w-2 h-2 bg-black rounded-sm" />}
          </div>
          <input
            type="checkbox"
            checked={parameter.required}
            onChange={(e) => onChange({ required: e.target.checked })}
            className="hidden"
          />
          <span className="text-[10px] text-white/40 group-hover:text-white/60 uppercase tracking-wide">Req</span>
        </label>

        <button
          onClick={onDelete}
          className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

