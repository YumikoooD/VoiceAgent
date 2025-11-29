'use client';

import React, { useState, useCallback } from 'react';
import { AgentConfig, createEmptyAgent } from '../types';
import { useAgentStorage } from '../hooks/useAgentStorage';
import { allAgentSets } from '@/app/agentConfigs';
import { convertFromRealtimeAgent } from '../utils/agentConverter';
import AgentForm from './AgentForm';
import AgentList from './AgentList';
import PreviewPanel from './PreviewPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Plus } from 'lucide-react';

export default function AgentBuilder() {
  const { agents, isLoaded, saveAgent, deleteAgent, exportAgents, importAgents, exportSingleAgent } = useAgentStorage();
  
  // Convert built-in SCENARIOS to AgentConfig format
  // Show scenarios as single entries with friendly names, not individual sub-agents
  const SCENARIO_DISPLAY_INFO: Record<string, { name: string; description: string }> = {
    customerSupport: {
      name: '🎧 Customer Support',
      description: 'Multi-tier support system with agent handoffs and escalation capabilities'
    },
    personalCoach: {
      name: '🎯 Personal Coach',
      description: 'Motivational coach for goal-setting, productivity, and personal development'
    }
  };

  const builtInAgents = React.useMemo(() => {
    return Object.entries(allAgentSets).map(([scenarioKey, agentSet]) => {
      const primaryAgent = agentSet[0];
      if (!primaryAgent) return null;
      
      const config = convertFromRealtimeAgent(primaryAgent, true);
      const displayInfo = SCENARIO_DISPLAY_INFO[scenarioKey];
      
      // Override with user-friendly scenario info
      config.id = `builtin_${scenarioKey}`;
      config.name = displayInfo?.name || scenarioKey;
      config.handoffDescription = displayInfo?.description || `Built-in scenario with ${agentSet.length} agent(s)`;
      
      return config;
    }).filter((agent): agent is AgentConfig => agent !== null);
  }, []);

  const allAgents = React.useMemo(() => {
    return [...builtInAgents, ...agents];
  }, [builtInAgents, agents]);

  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCreateNew = useCallback(() => {
    setSelectedAgent(createEmptyAgent());
    setIsEditing(true);
    setShowPreview(false);
  }, []);

  const handleEdit = useCallback((agent: AgentConfig) => {
    if (agent.isReadOnly) {
      // If read-only, clone it first
      const clonedAgent = { 
        ...agent, 
        id: crypto.randomUUID(),
        name: `${agent.name} (Copy)`,
        isReadOnly: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setSelectedAgent(clonedAgent);
      setIsEditing(true);
      setShowPreview(false);
    } else {
      setSelectedAgent(agent);
      setIsEditing(true);
      setShowPreview(false);
    }
  }, []);

  const handleSave = useCallback((agent: AgentConfig) => {
    saveAgent(agent);
    setIsEditing(false);
    // Keep selected agent but exit edit mode to show details/preview
    setSelectedAgent(agent);
    setShowPreview(true);
  }, [saveAgent]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (!selectedAgent?.id) {
      setSelectedAgent(null);
    } else {
      setShowPreview(true);
    }
  }, [selectedAgent]);

  const handleDelete = useCallback((agentId: string) => {
    const agentToDelete = allAgents.find(a => a.id === agentId);
    if (agentToDelete?.isReadOnly) {
      alert("Built-in agents cannot be deleted.");
      return;
    }

    if (confirm('Are you sure you want to delete this agent?')) {
      deleteAgent(agentId);
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(null);
        setIsEditing(false);
        setShowPreview(false);
      }
    }
  }, [deleteAgent, selectedAgent, allAgents]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await importAgents(file);
      // Optional: Show success toast
    } catch (error) {
      alert(`Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    e.target.value = '';
  }, [importAgents]);

  const handlePreview = useCallback((agent: AgentConfig) => {
    setSelectedAgent(agent);
    setShowPreview(true);
    setIsEditing(false);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 px-6 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-neon-cyan rounded-full" />
            <h1 className="text-sm font-medium tracking-wider uppercase text-white/80">
              Agent Builder
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-colors" title="Import Agents">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={exportAgents}
            disabled={agents.length === 0}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
            title="Export All"
          >
            <Download className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full transition-all border border-white/5 hover:border-white/20"
          >
            <Plus className="w-3.5 h-3.5" />
            New Agent
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-16 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {isEditing && selectedAgent ? (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full min-h-full"
            >
              <AgentForm
                agent={selectedAgent}
                existingAgents={agents.filter(a => a.id !== selectedAgent.id)}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </motion.div>
          ) : showPreview && selectedAgent ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full min-h-full"
            >
              <PreviewPanel
                agent={selectedAgent}
                onClose={() => setShowPreview(false)}
                onEdit={() => {
                  setShowPreview(false);
                  setIsEditing(true);
                }}
                onExport={() => exportSingleAgent(selectedAgent)}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl font-light text-white mb-4">Select an Agent to Edit</h2>
                  <p className="text-white/40">Manage your custom voice agents or create a new one.</p>
                </div>
                
                <AgentList
                  agents={allAgents}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                  onCreateNew={handleCreateNew}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
