// Types for the Agent Builder

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enumValues?: string[]; // For enum types
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  parameters: ToolParameter[];
}

export interface AgentConfig {
  id: string;
  name: string;
  voice: VoiceOption;
  handoffDescription: string;
  instructions: string;
  tools: ToolConfig[];
  handoffs: string[]; // Agent IDs
  createdAt: string;
  updatedAt: string;
}

export type VoiceOption = 'sage' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';

export const VOICE_OPTIONS: { value: VoiceOption; label: string; description: string }[] = [
  { value: 'sage', label: 'Sage', description: 'Calm and wise' },
  { value: 'alloy', label: 'Alloy', description: 'Neutral and balanced' },
  { value: 'echo', label: 'Echo', description: 'Soft and reflective' },
  { value: 'fable', label: 'Fable', description: 'Warm and narrative' },
  { value: 'onyx', label: 'Onyx', description: 'Deep and authoritative' },
  { value: 'shimmer', label: 'Shimmer', description: 'Bright and energetic' },
];

export const PARAMETER_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' },
] as const;

export function createEmptyAgent(): AgentConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    voice: 'sage',
    handoffDescription: '',
    instructions: '',
    tools: [],
    handoffs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyTool(): ToolConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    parameters: [],
  };
}

export function createEmptyParameter(): ToolParameter {
  return {
    name: '',
    type: 'string',
    description: '',
    required: false,
  };
}

