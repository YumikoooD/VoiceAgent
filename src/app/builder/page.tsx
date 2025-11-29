import React from 'react';
import AgentBuilder from './components/AgentBuilder';

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-neon-cyan/30">
      <AgentBuilder />
    </div>
  );
}

