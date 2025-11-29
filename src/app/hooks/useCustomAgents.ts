'use client';

import { useState, useEffect, useCallback } from 'react';
import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { getGmailAccessToken } from './useGmailAuth';

// Type matching the builder's AgentConfig
interface BuilderToolConfig {
  id: string;
  name: string;
  description: string;
  parameters: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    required: boolean;
  }[];
  // Webhook configuration for custom tools
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  webhookHeaders?: Record<string, string>;
}

interface BuilderAgentConfig {
  id: string;
  name: string;
  voice: 'sage' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';
  handoffDescription: string;
  instructions: string;
  tools: BuilderToolConfig[];
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

        // Gmail Integration Logic
        if (toolConfig.name.startsWith('gmail_')) {
          return executeGmailTool(toolConfig.name, input);
        }

        // Calendar Integration Logic
        if (toolConfig.name.startsWith('calendar_')) {
          return executeCalendarTool(toolConfig.name, input);
        }

        // Webhook Tool Logic - if tool has a webhook URL configured
        if (toolConfig.webhookUrl) {
          return executeWebhookTool(toolConfig, input);
        }

        // Return a stub response for tools without implementation
        return { 
          success: true, 
          message: `Tool ${toolConfig.name} executed successfully (no webhook configured)`,
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

/**
 * Execute Gmail tools using the real Gmail API via our proxy
 */
async function executeGmailTool(toolName: string, args: any): Promise<any> {
  const accessToken = getGmailAccessToken();

  if (!accessToken) {
    return { 
      error: 'Gmail not connected. Please connect your Gmail account in the Agent Builder settings.',
      requiresAuth: true
    };
  }

  console.log(`[Gmail API] Executing ${toolName}`, args);

  // Map tool names to API actions
  const actionMap: Record<string, string> = {
    'gmail_list_unread': 'list_unread',
    'gmail_read_email': 'read_email',
    'gmail_send_email': 'send_email',
    'gmail_delete_email': 'delete_email',
    'gmail_create_draft': 'create_draft',
  };

  const action = actionMap[toolName];
  if (!action) {
    return { error: `Unknown Gmail tool: ${toolName}` };
  }

  try {
    const response = await fetch('/api/gmail/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        accessToken,
        params: args,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // If unauthorized, token might be expired
      if (response.status === 401) {
        return { 
          error: 'Gmail session expired. Please reconnect your Gmail account.',
          requiresAuth: true
        };
      }
      return { error: result.error || 'Gmail API error' };
    }

    return result;
  } catch (error) {
    console.error('[Gmail API] Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to call Gmail API' };
  }
}

/**
 * Execute Calendar tools using the Google Calendar API via our proxy
 */
async function executeCalendarTool(toolName: string, args: any): Promise<any> {
  const accessToken = getGmailAccessToken(); // Same Google OAuth token

  if (!accessToken) {
    return { 
      error: 'Google account not connected. Please connect your Google account in the Agent Builder settings.',
      requiresAuth: true
    };
  }

  console.log(`[Calendar API] Executing ${toolName}`, args);

  // Map tool names to API actions
  const actionMap: Record<string, string> = {
    'calendar_list_events': 'list_events',
    'calendar_create_event': 'create_event',
    'calendar_get_event': 'get_event',
    'calendar_delete_event': 'delete_event',
    'calendar_update_event': 'update_event',
  };

  const action = actionMap[toolName];
  if (!action) {
    return { error: `Unknown Calendar tool: ${toolName}` };
  }

  try {
    const response = await fetch('/api/calendar/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        accessToken,
        params: args,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // If unauthorized, token might be expired
      if (response.status === 401) {
        return { 
          error: 'Google session expired. Please reconnect your Google account.',
          requiresAuth: true
        };
      }
      return { error: result.error || 'Calendar API error' };
    }

    return result;
  } catch (error) {
    console.error('[Calendar API] Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to call Calendar API' };
  }
}

/**
 * Execute custom tools via webhook
 */
async function executeWebhookTool(toolConfig: BuilderToolConfig, args: any): Promise<any> {
  if (!toolConfig.webhookUrl) {
    return { error: 'No webhook URL configured for this tool' };
  }

  console.log(`[Webhook] Executing ${toolConfig.name} via ${toolConfig.webhookUrl}`, args);

  try {
    const response = await fetch('/api/webhook/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl: toolConfig.webhookUrl,
        method: toolConfig.webhookMethod || 'POST',
        headers: toolConfig.webhookHeaders || {},
        params: args,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        error: result.error || `Webhook failed with status ${response.status}`,
        details: result
      };
    }

    return result.data || result;
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to call webhook' };
  }
}

