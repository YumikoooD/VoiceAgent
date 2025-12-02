'use client';

import React, { useState } from 'react';
import { ToolConfig, ToolParameter, PARAMETER_TYPES, createEmptyParameter } from '../types';
import { ChevronRight, X, Plus, Link, Globe, Info, HelpCircle, Play, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolBuilderProps {
  tool: ToolConfig;
  index: number;
  errors: Record<string, string>;
  onChange: (tool: ToolConfig) => void;
  onDelete: () => void;
}

export default function ToolBuilder({ tool, index, errors, onChange, onDelete }: ToolBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'definition' | 'webhook'>('definition');
  const [showWebhookHelp, setShowWebhookHelp] = useState(false);
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});

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

  const runTest = async (url: string, method: string, id: string) => {
    setTestStatus(prev => ({ ...prev, [id]: 'loading' }));
    try {
      // Simple fetch to test the URL
      // Note: This runs client-side, so it might hit CORS issues if the API doesn't allow it.
      // In a real production app, you might want to proxy this through your backend.
      const response = await fetch(url, { method });
      
      if (response.ok) {
        setTestStatus(prev => ({ ...prev, [id]: 'success' }));
        setTimeout(() => setTestStatus(prev => ({ ...prev, [id]: 'idle' })), 3000);
      } else {
        setTestStatus(prev => ({ ...prev, [id]: 'error' }));
        setTimeout(() => setTestStatus(prev => ({ ...prev, [id]: 'idle' })), 3000);
      }
    } catch (error) {
      setTestStatus(prev => ({ ...prev, [id]: 'error' }));
      setTimeout(() => setTestStatus(prev => ({ ...prev, [id]: 'idle' })), 3000);
    }
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
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5 overflow-hidden"
          >
            {/* Tabs */}
            {!tool.name.startsWith('gmail_') && !tool.name.startsWith('calendar_') && (
              <div className="flex items-center border-b border-white/5">
                <button
                  onClick={() => setActiveTab('definition')}
                  className={`px-6 py-3 text-xs font-medium uppercase tracking-wider transition-colors border-b-2 relative ${
                    activeTab === 'definition'
                      ? 'text-white border-neon-cyan'
                      : 'text-white/40 border-transparent hover:text-white/60'
                  }`}
                >
                  Definition
                  {activeTab === 'definition' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('webhook')}
                  className={`px-6 py-3 text-xs font-medium uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 relative ${
                    activeTab === 'webhook'
                      ? 'text-white border-neon-purple'
                      : 'text-white/40 border-transparent hover:text-white/60'
                  }`}
                >
                  Integration
                  {tool.webhookUrl && (
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  )}
                  {activeTab === 'webhook' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple"
                    />
                  )}
                </button>
              </div>
            )}

            <div className="p-5 space-y-6">
              {/* Definition Tab */}
              {(activeTab === 'definition' || tool.name.startsWith('gmail_') || tool.name.startsWith('calendar_')) && (
                <motion.div
                  key="definition"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
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
                        <AnimatePresence>
                          {tool.parameters.map((param, paramIndex) => (
                            <motion.div
                              key={paramIndex}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            >
                              <ParameterRow
                                parameter={param}
                                onChange={(updates) => updateParameter(paramIndex, updates)}
                                onDelete={() => deleteParameter(paramIndex)}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Webhook/Integration Tab */}
              {activeTab === 'webhook' && !tool.name.startsWith('gmail_') && !tool.name.startsWith('calendar_') && (
                <motion.div
                  key="webhook"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
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
                  <AnimatePresence>
                    {showWebhookHelp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mb-6 p-4 bg-neon-purple/5 border border-neon-purple/10 rounded-lg text-xs text-white/60 space-y-3">
                          <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 text-neon-purple mt-0.5 flex-shrink-0" />
                            <div className="space-y-4 flex-1">
                              <div>
                                <p className="text-white mb-2 font-medium">Understanding Webhooks</p>
                                <p className="mb-2">A webhook allows your agent to get information from or take action on another service (like checking a database or adding a calendar event).</p>
                                <ul className="list-disc pl-4 space-y-1 text-white/50">
                                  <li><strong>GET:</strong> Use this to <span className="text-neon-cyan">retrieve</span> information (e.g., "Get weather"). Parameters are added to the URL.</li>
                                  <li><strong>POST:</strong> Use this to <span className="text-neon-cyan">send</span> information (e.g., "Save order"). Parameters are sent in the body.</li>
                                  <li><strong>Headers:</strong> This is where you put passwords or API keys to prove who you are.</li>
                                </ul>
                              </div>
                              
                              <div className="pt-3 border-t border-neon-purple/10">
                                <p className="text-white mb-2 font-medium">Try It Yourself</p>
                                <div className="grid gap-2">
                                  {/* Example 1: JSONPlaceholder */}
                                  <div className="bg-black/20 p-3 rounded border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-1 relative z-10">
                                      <div className="flex items-center gap-2">
                                        <span className="text-neon-cyan font-mono font-medium">Simple Data Fetch</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/60">GET</span>
                                      </div>
                                      <button 
                                        onClick={() => runTest('https://jsonplaceholder.typicode.com/posts/1', 'GET', 'json')}
                                        className={`p-1.5 rounded flex items-center gap-1.5 transition-all ${
                                          testStatus['json'] === 'success' ? 'bg-green-500/20 text-green-400' :
                                          testStatus['json'] === 'error' ? 'bg-red-500/20 text-red-400' :
                                          testStatus['json'] === 'loading' ? 'bg-white/10 text-white/60' :
                                          'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                                        }`}
                                      >
                                        {testStatus['json'] === 'loading' ? (
                                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : testStatus['json'] === 'success' ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Success</span>
                                          </>
                                        ) : testStatus['json'] === 'error' ? (
                                          <>
                                            <AlertCircle className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Failed</span>
                                          </>
                                        ) : (
                                          <>
                                            <Play className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Test</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <p className="text-[10px] mb-2 relative z-10">
                                      Retrieves a fake blog post. Good for testing if your agent can read data.
                                    </p>
                                    <div className="relative z-10">
                                      <div className="font-mono text-[10px] text-white/70 bg-black/40 p-2 rounded pr-8 select-all border border-transparent group-hover:border-white/10 transition-colors">
                                        https://jsonplaceholder.typicode.com/posts/1
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Example 2: REST Countries */}
                                  <div className="bg-black/20 p-3 rounded border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-1 relative z-10">
                                      <div className="flex items-center gap-2">
                                        <span className="text-neon-cyan font-mono font-medium">Dynamic Search</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/60">GET</span>
                                      </div>
                                      <button 
                                        onClick={() => runTest('https://restcountries.com/v3.1/name/france', 'GET', 'rest')}
                                        className={`p-1.5 rounded flex items-center gap-1.5 transition-all ${
                                          testStatus['rest'] === 'success' ? 'bg-green-500/20 text-green-400' :
                                          testStatus['rest'] === 'error' ? 'bg-red-500/20 text-red-400' :
                                          testStatus['rest'] === 'loading' ? 'bg-white/10 text-white/60' :
                                          'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                                        }`}
                                      >
                                        {testStatus['rest'] === 'loading' ? (
                                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : testStatus['rest'] === 'success' ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Success</span>
                                          </>
                                        ) : testStatus['rest'] === 'error' ? (
                                          <>
                                            <AlertCircle className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Failed</span>
                                          </>
                                        ) : (
                                          <>
                                            <Play className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Test</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <p className="text-[10px] mb-2 relative z-10">
                                      Finds country info based on your parameter. Add a parameter named <code className="text-white">country</code> to test.
                                    </p>
                                    <div className="relative z-10">
                                      <div className="font-mono text-[10px] text-white/70 bg-black/40 p-2 rounded pr-8 select-all border border-transparent group-hover:border-white/10 transition-colors">
                                        https://restcountries.com/v3.1/name/&#123;country&#125;
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Example 3: HTTPBin */}
                                  <div className="bg-black/20 p-3 rounded border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-1 relative z-10">
                                      <div className="flex items-center gap-2">
                                        <span className="text-neon-cyan font-mono font-medium">Data Submission</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/60">POST</span>
                                      </div>
                                      <button 
                                        onClick={() => runTest('https://httpbin.org/post', 'POST', 'bin')}
                                        className={`p-1.5 rounded flex items-center gap-1.5 transition-all ${
                                          testStatus['bin'] === 'success' ? 'bg-green-500/20 text-green-400' :
                                          testStatus['bin'] === 'error' ? 'bg-red-500/20 text-red-400' :
                                          testStatus['bin'] === 'loading' ? 'bg-white/10 text-white/60' :
                                          'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                                        }`}
                                      >
                                        {testStatus['bin'] === 'loading' ? (
                                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : testStatus['bin'] === 'success' ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Success</span>
                                          </>
                                        ) : testStatus['bin'] === 'error' ? (
                                          <>
                                            <AlertCircle className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Failed</span>
                                          </>
                                        ) : (
                                          <>
                                            <Play className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Test</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <p className="text-[10px] mb-2 relative z-10">
                                      Echoes back whatever you send. Great for verifying that your parameters are being sent correctly.
                                    </p>
                                    <div className="relative z-10">
                                      <div className="font-mono text-[10px] text-white/70 bg-black/40 p-2 rounded pr-8 select-all border border-transparent group-hover:border-white/10 transition-colors">
                                        https://httpbin.org/post
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

