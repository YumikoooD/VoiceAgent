'use client';

import React, { useState, useCallback } from 'react';
import { AgentConfig, createEmptyAgent } from '../types';
import { useAgentStorage } from '../hooks/useAgentStorage';
import AgentForm from './AgentForm';
import AgentList from './AgentList';
import PreviewPanel from './PreviewPanel';
import Link from 'next/link';

export default function AgentBuilder() {
  const { agents, isLoaded, saveAgent, deleteAgent, exportAgents, importAgents, exportSingleAgent } = useAgentStorage();
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCreateNew = useCallback(() => {
    setSelectedAgent(createEmptyAgent());
    setIsEditing(true);
  }, []);

  const handleEdit = useCallback((agent: AgentConfig) => {
    setSelectedAgent(agent);
    setIsEditing(true);
  }, []);

  const handleSave = useCallback((agent: AgentConfig) => {
    saveAgent(agent);
    setIsEditing(false);
    setSelectedAgent(null);
  }, [saveAgent]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setSelectedAgent(null);
  }, []);

  const handleDelete = useCallback((agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteAgent(agentId);
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(null);
        setIsEditing(false);
      }
    }
  }, [deleteAgent, selectedAgent]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await importAgents(file);
      alert('Agents imported successfully!');
    } catch (error) {
      alert(`Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Reset input
    e.target.value = '';
  }, [importAgents]);

  const handlePreview = useCallback((agent: AgentConfig) => {
    setSelectedAgent(agent);
    setShowPreview(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="text-slate-400 hover:text-white transition-colors"
              >
                ← Back to App
              </Link>
              <h1 className="text-2xl font-bold text-white">
                Agent Builder
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition-colors">
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportAgents}
                disabled={agents.length === 0}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Export All
              </button>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
              >
                + New Agent
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {isEditing && selectedAgent ? (
          <AgentForm
            agent={selectedAgent}
            existingAgents={agents.filter(a => a.id !== selectedAgent.id)}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : showPreview && selectedAgent ? (
          <PreviewPanel
            agent={selectedAgent}
            onClose={() => setShowPreview(false)}
            onEdit={() => {
              setShowPreview(false);
              setIsEditing(true);
            }}
            onExport={() => exportSingleAgent(selectedAgent)}
          />
        ) : (
          <AgentList
            agents={agents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onCreateNew={handleCreateNew}
          />
        )}
      </main>
    </div>
  );
}

