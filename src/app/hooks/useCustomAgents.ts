'use client';

import { useState, useEffect, useCallback } from 'react';
import { RealtimeAgent, tool } from '@openai/agents/realtime';

// Type matching the builder's AgentConfig
interface BuilderAgentConfig {
  id: string;
  name: string;
  voice: 'sage' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';
  handoffDescription: string;
  instructions: string;
  tools: {
    id: string;
    name: string;
    description: string;
    parameters: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      description: string;
      required: boolean;
    }[];
  }[];
  handoffs: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'voice-agent-builder-agents';

/**
 * Hook to load custom agents from localStorage and convert them to RealtimeAgents.
 */
export function useCustomAgents() {
  const [customAgentSets, setCustomAgentSets] = useState<Record<string, RealtimeAgent[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const loadAgents = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const configs: BuilderAgentConfig[] = JSON.parse(stored);
        const agentSets: Record<string, RealtimeAgent[]> = {};

        configs.forEach(config => {
          // Convert each config to a RealtimeAgent
          const agent = convertToRealtimeAgent(config);
          // Use the agent name as the key (with 'custom_' prefix to avoid conflicts)
          agentSets[`custom_${config.name}`] = [agent];
        });

        setCustomAgentSets(agentSets);
      }
    } catch (error) {
      console.error('Failed to load custom agents:', error);
    }
    setIsLoaded(true);
  }, []);

  // Load on mount
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Listen for storage changes (when builder saves)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadAgents();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadAgents]);

  return { customAgentSets, isLoaded, refresh: loadAgents };
}

/**
 * Converts a builder AgentConfig to a RealtimeAgent.
 */
function convertToRealtimeAgent(config: BuilderAgentConfig): RealtimeAgent {
  const tools = config.tools.map(toolConfig => {
    const properties: Record<string, { type: string; description: string }> = {};
    const required: string[] = [];

    toolConfig.parameters.forEach(param => {
      properties[param.name] = {
        type: param.type,
        description: param.description,
      };
      if (param.required) {
        required.push(param.name);
      }
    });

    return tool({
      name: toolConfig.name,
      description: toolConfig.description,
      parameters: {
        type: 'object',
        properties,
        required,
        additionalProperties: false,
      },
      execute: async (input: unknown) => {
        // Log the tool call for debugging
        console.log(`[Custom Agent] Tool "${toolConfig.name}" called with:`, input);
        // Return a stub response - in a real implementation, you'd want custom logic
        return { 
          success: true, 
          message: `Tool ${toolConfig.name} executed successfully`,
          input 
        };
      },
    });
  });

  return new RealtimeAgent({
    name: config.name,
    voice: config.voice,
    handoffDescription: config.handoffDescription,
    instructions: config.instructions,
    tools,
    handoffs: [], // Handoffs would need cross-agent resolution
  });
}

