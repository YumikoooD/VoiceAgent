'use client';

import { useState, useEffect, useCallback } from 'react';
import { AgentConfig } from '../types';

const STORAGE_KEY = 'voice-agent-builder-agents';

export function useAgentStorage() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load agents from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAgents(parsed);
      }
    } catch (error) {
      console.error('Failed to load agents from storage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save agents to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
    } catch (error) {
      console.error('Failed to save agents to storage:', error);
    }
  }, [agents, isLoaded]);

  const saveAgent = useCallback((agent: AgentConfig) => {
    setAgents(prev => {
      const existingIndex = prev.findIndex(a => a.id === agent.id);
      const updatedAgent = { ...agent, updatedAt: new Date().toISOString() };
      
      if (existingIndex >= 0) {
        // Update existing agent
        const updated = [...prev];
        updated[existingIndex] = updatedAgent;
        return updated;
      } else {
        // Add new agent
        return [...prev, updatedAgent];
      }
    });
  }, []);

  const deleteAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
  }, []);

  const getAgent = useCallback((agentId: string): AgentConfig | undefined => {
    return agents.find(a => a.id === agentId);
  }, [agents]);

  const exportAgents = useCallback(() => {
    const dataStr = JSON.stringify(agents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `voice-agents-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [agents]);

  const importAgents = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content) as AgentConfig[];
          
          // Validate imported data
          if (!Array.isArray(imported)) {
            throw new Error('Invalid format: expected an array');
          }
          
          // Merge with existing agents (update if same ID, add if new)
          setAgents(prev => {
            const merged = [...prev];
            for (const agent of imported) {
              const existingIndex = merged.findIndex(a => a.id === agent.id);
              if (existingIndex >= 0) {
                merged[existingIndex] = agent;
              } else {
                merged.push(agent);
              }
            }
            return merged;
          });
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }, []);

  const exportSingleAgent = useCallback((agent: AgentConfig) => {
    const dataStr = JSON.stringify(agent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent-${agent.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, []);

  return {
    agents,
    isLoaded,
    saveAgent,
    deleteAgent,
    getAgent,
    exportAgents,
    importAgents,
    exportSingleAgent,
  };
}

