'use client';

import React, { useState, useCallback } from 'react';
import { AgentConfig, ToolConfig, VOICE_OPTIONS, createEmptyTool } from '../types';
import ToolBuilder from './ToolBuilder';
import HandoffSelector from './HandoffSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  FileText, 
  Wrench, 
  GitCompare, 
  Save, 
  X, 
  Mic, 
  Sparkles, 
  ChevronRight,
  Plus
} from 'lucide-react';

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
    { id: 'basic', label: 'Identity', icon: <User className="w-4 h-4" /> },
    { id: 'instructions', label: 'Instructions', icon: <FileText className="w-4 h-4" /> },
    { id: 'tools', label: `Tools (${agent.tools.length})`, icon: <Wrench className="w-4 h-4" /> },
    { id: 'handoffs', label: `Handoffs (${agent.handoffs.length})`, icon: <GitCompare className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="flex flex-col bg-black">
      {/* Form Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/50 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-light text-white">
            {initialAgent.name ? `Editing ${initialAgent.name}` : 'New Agent'}
          </h2>
          <p className="text-sm text-white/40 font-mono mt-1">
            {activeTab === 'basic' && 'Configure basic identity and voice'}
            {activeTab === 'instructions' && 'Define personality and behavior'}
            {activeTab === 'tools' && 'Add capabilities and functions'}
            {activeTab === 'handoffs' && 'Manage connections to other agents'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            <Save className="w-4 h-4" />
            Save Agent
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-white/5 bg-black/30 p-4 flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabIndicator" className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
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
    <div className="space-y-8">
      {/* Name Section */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-light text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-neon-cyan" />
          Identity
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
              Internal Name
            </label>
            <input
              type="text"
              value={agent.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g., customerSupport"
              className={`w-full px-4 py-3 bg-black/50 border rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors font-mono text-sm ${
                errors.name ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {errors.name && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
             <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
              Handoff Description
            </label>
            <textarea
              value={agent.handoffDescription}
              onChange={(e) => onChange({ handoffDescription: e.target.value })}
              placeholder="Briefly describe what this agent handles (e.g., 'Handles returns and refunds')"
              rows={2}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Voice Section */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-light text-white mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-neon-purple" />
          Voice Persona
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {VOICE_OPTIONS.map(voice => (
            <button
              key={voice.value}
              type="button"
              onClick={() => onChange({ voice: voice.value })}
              className={`relative p-4 rounded-xl border text-left transition-all duration-200 group overflow-hidden ${
                agent.voice === voice.value
                  ? 'border-white/40 bg-white/10'
                  : 'border-white/5 bg-black/50 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              {agent.voice === voice.value && (
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 opacity-50" />
              )}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{voice.label}</span>
                  {agent.voice === voice.value && (
                    <div className="w-2 h-2 bg-neon-cyan rounded-full shadow-[0_0_8px_#06b6d4]" />
                  )}
                </div>
                <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                  {voice.description}
                </p>
              </div>
            </button>
          ))}
        </div>
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
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider whitespace-nowrap">Quick Templates:</span>
        {[
          { label: 'Customer Support', template: CUSTOMER_SUPPORT_TEMPLATE },
          { label: 'Sales Assistant', template: SALES_TEMPLATE },
          { label: 'General Helper', template: GENERAL_TEMPLATE },
        ].map(({ label, template }) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(template)}
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white/70 hover:text-white rounded-full transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 relative">
        <textarea
          value={instructions}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Personality and Tone..."
          className={`w-full h-[600px] px-6 py-6 bg-black/50 border rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-white/40 font-mono text-sm leading-relaxed resize-none ${
            error ? 'border-red-500' : 'border-white/10'
          }`}
        />
        {error && (
          <p className="absolute bottom-4 left-6 text-xs text-red-400 bg-black/80 px-2 py-1 rounded">
            {error}
          </p>
        )}
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
          <h3 className="text-lg font-light text-white">Function Tools</h3>
          <p className="text-sm text-white/40 mt-1">
            Define capabilities the model can invoke
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm border border-white/5"
        >
          <Plus className="w-4 h-4" />
          Add Tool
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/60 mb-4">No tools defined yet</p>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Create First Tool
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ToolBuilder
                tool={tool}
                index={index}
                errors={errors}
                onChange={(updated) => onUpdate(index, updated)}
                onDelete={() => onDelete(index)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Templates (kept same content)
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
