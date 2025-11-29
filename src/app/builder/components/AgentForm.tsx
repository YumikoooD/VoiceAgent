'use client';

import React, { useState, useCallback } from 'react';
import { AgentConfig, ToolConfig, VOICE_OPTIONS, createEmptyTool } from '../types';
import ToolBuilder from './ToolBuilder';
import HandoffSelector from './HandoffSelector';

interface AgentFormProps {
  agent: AgentConfig;
  existingAgents: AgentConfig[];
  onSave: (agent: AgentConfig) => void;
  onCancel: () => void;
}

export default function AgentForm({ agent: initialAgent, existingAgents, onSave, onCancel }: AgentFormProps) {
  const [agent, setAgent] = useState<AgentConfig>(initialAgent);
  const [activeTab, setActiveTab] = useState<'basic' | 'instructions' | 'tools' | 'handoffs'>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateAgent = useCallback((updates: Partial<AgentConfig>) => {
    setAgent(prev => ({ ...prev, ...updates }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!agent.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(agent.name)) {
      newErrors.name = 'Name must start with a letter and contain only letters, numbers, and underscores';
    }

    if (!agent.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }

    // Validate tools
    agent.tools.forEach((tool, index) => {
      if (!tool.name.trim()) {
        newErrors[`tool_${index}_name`] = 'Tool name is required';
      }
      if (!tool.description.trim()) {
        newErrors[`tool_${index}_description`] = 'Tool description is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [agent]);

  const handleSave = useCallback(() => {
    if (validate()) {
      onSave(agent);
    }
  }, [agent, validate, onSave]);

  const handleAddTool = useCallback(() => {
    updateAgent({
      tools: [...agent.tools, createEmptyTool()],
    });
  }, [agent.tools, updateAgent]);

  const handleUpdateTool = useCallback((index: number, tool: ToolConfig) => {
    const newTools = [...agent.tools];
    newTools[index] = tool;
    updateAgent({ tools: newTools });
  }, [agent.tools, updateAgent]);

  const handleDeleteTool = useCallback((index: number) => {
    updateAgent({
      tools: agent.tools.filter((_, i) => i !== index),
    });
  }, [agent.tools, updateAgent]);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'instructions', label: 'Instructions', icon: '📋' },
    { id: 'tools', label: `Tools (${agent.tools.length})`, icon: '🔧' },
    { id: 'handoffs', label: `Handoffs (${agent.handoffs.length})`, icon: '🔄' },
  ] as const;

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {initialAgent.name ? `Edit: ${initialAgent.name}` : 'Create New Agent'}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            Save Agent
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-emerald-500 bg-slate-800/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'basic' && (
          <BasicInfoTab
            agent={agent}
            errors={errors}
            onChange={updateAgent}
          />
        )}

        {activeTab === 'instructions' && (
          <InstructionsTab
            instructions={agent.instructions}
            error={errors.instructions}
            onChange={(instructions) => updateAgent({ instructions })}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsTab
            tools={agent.tools}
            errors={errors}
            onAdd={handleAddTool}
            onUpdate={handleUpdateTool}
            onDelete={handleDeleteTool}
          />
        )}

        {activeTab === 'handoffs' && (
          <HandoffSelector
            selectedHandoffs={agent.handoffs}
            availableAgents={existingAgents}
            onChange={(handoffs) => updateAgent({ handoffs })}
          />
        )}
      </div>
    </div>
  );
}

// Basic Info Tab Component
interface BasicInfoTabProps {
  agent: AgentConfig;
  errors: Record<string, string>;
  onChange: (updates: Partial<AgentConfig>) => void;
}

function BasicInfoTab({ agent, errors, onChange }: BasicInfoTabProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Agent Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={agent.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g., customerSupport"
          className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors.name ? 'border-red-500' : 'border-slate-600'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Use camelCase, e.g., myAgent, salesAssistant
        </p>
      </div>

      {/* Voice */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Voice
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VOICE_OPTIONS.map(voice => (
            <button
              key={voice.value}
              type="button"
              onClick={() => onChange({ voice: voice.value })}
              className={`p-3 rounded-lg border text-left transition-colors ${
                agent.voice === voice.value
                  ? 'border-emerald-500 bg-emerald-500/10 text-white'
                  : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-medium">{voice.label}</div>
              <div className="text-xs text-slate-400">{voice.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Handoff Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Handoff Description
        </label>
        <textarea
          value={agent.handoffDescription}
          onChange={(e) => onChange({ handoffDescription: e.target.value })}
          placeholder="Brief description of what this agent handles (used when other agents decide to hand off)"
          rows={3}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          This helps other agents understand when to transfer to this agent
        </p>
      </div>
    </div>
  );
}

// Instructions Tab Component
interface InstructionsTabProps {
  instructions: string;
  error?: string;
  onChange: (instructions: string) => void;
}

function InstructionsTab({ instructions, error, onChange }: InstructionsTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Agent Instructions <span className="text-red-400">*</span>
        </label>
        <p className="text-sm text-slate-400 mb-4">
          Define your agent&apos;s personality, behavior, and capabilities. Use markdown for formatting.
        </p>
        <textarea
          value={instructions}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`# Personality and Tone
You are a helpful assistant...

# Instructions
- Always greet the user warmly
- Be concise and clear
- Ask clarifying questions when needed

# Capabilities
- Answer questions about products
- Help with orders
- Provide support`}
          rows={20}
          className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm ${
            error ? 'border-red-500' : 'border-slate-600'
          }`}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Quick Templates */}
      <div>
        <p className="text-sm font-medium text-slate-300 mb-2">Quick Templates</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Customer Support', template: CUSTOMER_SUPPORT_TEMPLATE },
            { label: 'Sales Assistant', template: SALES_TEMPLATE },
            { label: 'General Helper', template: GENERAL_TEMPLATE },
          ].map(({ label, template }) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange(template)}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tools Tab Component
interface ToolsTabProps {
  tools: ToolConfig[];
  errors: Record<string, string>;
  onAdd: () => void;
  onUpdate: (index: number, tool: ToolConfig) => void;
  onDelete: (index: number) => void;
}

function ToolsTab({ tools, errors, onAdd, onUpdate, onDelete }: ToolsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Tools</h3>
          <p className="text-sm text-slate-400">
            Define the functions your agent can call
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          + Add Tool
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-lg border border-dashed border-slate-600">
          <div className="text-4xl mb-3">🔧</div>
          <p className="text-slate-400 mb-4">No tools defined yet</p>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Add Your First Tool
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tools.map((tool, index) => (
            <ToolBuilder
              key={tool.id}
              tool={tool}
              index={index}
              errors={errors}
              onChange={(updated) => onUpdate(index, updated)}
              onDelete={() => onDelete(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Templates
const CUSTOMER_SUPPORT_TEMPLATE = `# Personality and Tone
You are a friendly and helpful customer support agent. You are patient, empathetic, and always aim to resolve customer issues efficiently.

# Instructions
- Always greet the customer warmly
- Listen carefully to understand their issue
- Provide clear and concise solutions
- If you can't resolve an issue, offer to escalate to a human
- Thank the customer at the end of each interaction

# Tone
- Professional but friendly
- Patient and understanding
- Clear and concise
- Avoid jargon

# Capabilities
- Answer questions about products and services
- Help with order status and tracking
- Process returns and refunds
- Escalate complex issues to human agents`;

const SALES_TEMPLATE = `# Personality and Tone
You are an enthusiastic sales assistant who helps customers find the perfect products for their needs.

# Instructions
- Understand the customer's needs through questions
- Recommend products that match their requirements
- Highlight key features and benefits
- Be honest about product limitations
- Offer to help with the purchasing process

# Tone
- Enthusiastic but not pushy
- Helpful and knowledgeable
- Honest and transparent

# Capabilities
- Product recommendations
- Feature comparisons
- Pricing information
- Availability checking`;

const GENERAL_TEMPLATE = `# Personality and Tone
You are a helpful assistant ready to assist with a variety of tasks.

# Instructions
- Be helpful and responsive
- Ask clarifying questions when needed
- Provide accurate information
- Be honest when you don't know something

# Tone
- Friendly and professional
- Clear and concise

# Capabilities
- Answer questions
- Provide information
- Assist with tasks`;

