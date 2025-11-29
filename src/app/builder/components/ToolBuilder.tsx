'use client';

import React, { useState } from 'react';
import { ToolConfig, ToolParameter, PARAMETER_TYPES, createEmptyParameter } from '../types';

interface ToolBuilderProps {
  tool: ToolConfig;
  index: number;
  errors: Record<string, string>;
  onChange: (tool: ToolConfig) => void;
  onDelete: () => void;
}

export default function ToolBuilder({ tool, index, errors, onChange, onDelete }: ToolBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

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

  return (
    <div className="bg-slate-900/50 border border-slate-600 rounded-lg overflow-hidden">
      {/* Tool Header */}
      <div
        className="px-4 py-3 bg-slate-800/50 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <button className="text-slate-400">
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-white font-medium">
            {tool.name || `Tool ${index + 1}`}
          </span>
          {tool.parameters.length > 0 && (
            <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
              {tool.parameters.length} param{tool.parameters.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tool Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Tool Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Tool Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={tool.name}
                onChange={(e) => updateTool({ name: e.target.value })}
                placeholder="e.g., searchProducts"
                className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors[`tool_${index}_name`] ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              {errors[`tool_${index}_name`] && (
                <p className="mt-1 text-xs text-red-400">{errors[`tool_${index}_name`]}</p>
              )}
            </div>
          </div>

          {/* Tool Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={tool.description}
              onChange={(e) => updateTool({ description: e.target.value })}
              placeholder="Describe what this tool does and when it should be used..."
              rows={2}
              className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                errors[`tool_${index}_description`] ? 'border-red-500' : 'border-slate-600'
              }`}
            />
            {errors[`tool_${index}_description`] && (
              <p className="mt-1 text-xs text-red-400">{errors[`tool_${index}_description`]}</p>
            )}
          </div>

          {/* Parameters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Parameters
              </label>
              <button
                onClick={addParameter}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                + Add Parameter
              </button>
            </div>

            {tool.parameters.length === 0 ? (
              <div className="text-center py-6 bg-slate-800/50 rounded-lg border border-dashed border-slate-600">
                <p className="text-sm text-slate-400">No parameters defined</p>
                <button
                  onClick={addParameter}
                  className="mt-2 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Add a parameter
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tool.parameters.map((param, paramIndex) => (
                  <ParameterRow
                    key={paramIndex}
                    parameter={param}
                    onChange={(updates) => updateParameter(paramIndex, updates)}
                    onDelete={() => deleteParameter(paramIndex)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
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
    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Parameter Name */}
        <div>
          <input
            type="text"
            value={parameter.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="name"
            className="w-full px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Parameter Type */}
        <div>
          <select
            value={parameter.type}
            onChange={(e) => onChange({ type: e.target.value as ToolParameter['type'] })}
            className="w-full px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {PARAMETER_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <input
            type="text"
            value={parameter.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Description"
            className="w-full px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Required Toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={parameter.required}
            onChange={(e) => onChange({ required: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
          />
          <span className="text-xs text-slate-400">Required</span>
        </label>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="p-1 text-slate-400 hover:text-red-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

