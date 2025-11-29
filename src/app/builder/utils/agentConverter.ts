// Utility to convert builder AgentConfig to SDK RealtimeAgent

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { AgentConfig } from '../types';

/**
 * Converts an AgentConfig from the builder to a RealtimeAgent for the SDK.
 * Note: Tool execute functions are stubbed since they're stored as config.
 */
export function convertToRealtimeAgent(config: AgentConfig): RealtimeAgent {
  const tools = config.tools.map(toolConfig => {
    const properties: Record<string, any> = {};
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
      execute: async () => {
        // Stubbed execute function
        // In a real implementation, you'd need to provide actual logic
        console.log(`Tool ${toolConfig.name} called (stubbed)`);
        return { success: true };
      },
    });
  });

  return new RealtimeAgent({
    name: config.name,
    voice: config.voice,
    handoffDescription: config.handoffDescription,
    instructions: config.instructions,
    tools,
    handoffs: [], // Handoffs need to be resolved separately
  });
}

/**
 * Converts multiple AgentConfigs to RealtimeAgents and resolves handoffs.
 */
export function convertAgentsWithHandoffs(configs: AgentConfig[]): RealtimeAgent[] {
  // First, create all agents without handoffs
  const agentMap = new Map<string, RealtimeAgent>();
  
  configs.forEach(config => {
    const agent = convertToRealtimeAgent(config);
    agentMap.set(config.id, agent);
  });

  // Then resolve handoffs
  configs.forEach(config => {
    const agent = agentMap.get(config.id);
    if (agent && config.handoffs.length > 0) {
      const handoffAgents = config.handoffs
        .map(handoffId => agentMap.get(handoffId))
        .filter((a): a is RealtimeAgent => a !== undefined);
      
      // Note: RealtimeAgent handoffs are set at construction time
      // This is a limitation - handoffs would need to be set during construction
      // For now, we'll return agents without cross-handoffs
    }
  });

  return Array.from(agentMap.values());
}

/**
 * Generates TypeScript code for an agent configuration.
 */
export function generateAgentCode(config: AgentConfig): string {
  const toolsCode = config.tools.map(toolConfig => {
    const paramsCode = toolConfig.parameters.length > 0
      ? `{
        type: 'object',
        properties: {
${toolConfig.parameters.map(p => `          ${p.name}: {
            type: '${p.type}',
            description: '${p.description.replace(/'/g, "\\'")}'
          }`).join(',\n')}
        },
        required: [${toolConfig.parameters.filter(p => p.required).map(p => `'${p.name}'`).join(', ')}],
        additionalProperties: false
      }`
      : `{
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      }`;

    return `    tool({
      name: '${toolConfig.name}',
      description: '${toolConfig.description.replace(/'/g, "\\'")}',
      parameters: ${paramsCode},
      execute: async (input: any) => {
        // TODO: Implement tool logic
        return { success: true };
      }
    })`;
  }).join(',\n');

  return `import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const ${config.name}Agent = new RealtimeAgent({
  name: '${config.name}',
  voice: '${config.voice}',
  handoffDescription: '${config.handoffDescription.replace(/'/g, "\\'")}',
  instructions: \`
${config.instructions}
\`,
  tools: [
${toolsCode}
  ],
  handoffs: [],
});

export const ${config.name}Scenario = [${config.name}Agent];
export default ${config.name}Scenario;
`;
}

