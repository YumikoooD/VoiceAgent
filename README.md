# Voice Agent Platform

![Voice Agent Platform Screenshot](/public/screenshot_platform.png)

A comprehensive voice agent platform built with Next.js, TypeScript, and the OpenAI Realtime API. This project demonstrates advanced patterns for building production-ready voice agents with multi-agent orchestration, real-time audio streaming, and intelligent agent handoffs.

## Overview

I built this platform to explore and demonstrate sophisticated voice agent architectures. The system supports multiple agent patterns, real-time WebRTC audio streaming, and provides a flexible foundation for building custom voice agent applications.

## Features

- 🎙️ **Real-time Voice Interaction** - Low-latency voice conversations using WebRTC
- 🌊 **Live Voice Visualization** - Real-time audio waveform and frequency visualization
- 🤖 **Multi-Agent Orchestration** - Seamless handoffs between specialized agents
- 🛡️ **Output Guardrails** - Built-in content moderation and safety checks
- 🎛️ **Flexible Agent Patterns** - Multiple architectural patterns for different use cases
- 📊 **Comprehensive Logging** - Full event tracking and conversation history
- 🎚️ **Audio Controls** - Push-to-talk, codec selection, and audio recording
- 🛠️ **Visual Agent Builder** - Create and configure agents without writing code

## Voice Visualization

The platform features real-time audio visualization that provides visual feedback during voice conversations. The visualizer uses the Web Audio API to analyze microphone input and display dynamic waveforms and frequency data.

### Visualization Modes

- **Bars Mode** (Default) - Frequency spectrum displayed as animated bars with cyberpunk-themed gradients
- **Waveform Mode** - Time-domain audio waveform with volume-based intensity
- **Circular Mode** - Radial frequency visualization with pulsing center

The visualizer automatically activates when connected to a voice session and provides real-time feedback with smooth animations and glow effects that match the platform's modern UI design.

## Agent Builder

![Agent Builder Screenshot](/public/screenshot_builder.png)

The platform includes a visual Agent Builder that allows you to create and configure agents without writing code.

### Accessing the Builder

1. Click the **"Open Builder"** button in the main app header
2. Or navigate directly to [http://localhost:3000/builder](http://localhost:3000/builder)

### Features

- **Visual Agent Configuration** - Configure agent name, voice, and instructions through a form interface
- **Tool Builder** - Define custom tools with parameters using a visual editor
- **Handoff Management** - Configure which agents can transfer to other agents
- **Preview & Export** - Preview agent configuration and export as JSON or TypeScript code
- **Local Storage** - Agents are saved to browser localStorage for persistence
- **Import/Export** - Import and export agent configurations as JSON files

## Architecture

The platform is built on Next.js 15 with React 19, using the OpenAI Agents SDK for agent management. The architecture supports:

- **WebRTC Audio Streaming** - Direct peer-to-peer audio connection with OpenAI's Realtime API
- **Agent Handoffs** - Dynamic transfer between specialized agents based on user intent
- **Tool Integration** - Extensible tool system for agent capabilities
- **State Management** - React contexts for transcript and event management

## Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- OpenAI API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create a .env file or export OPENAI_API_KEY
export OPENAI_API_KEY=your_api_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app defaults to the `chatSupervisor` agent configuration.

### Configuration

You can switch between different agent scenarios using the "Scenario" dropdown in the top right of the UI. Each scenario demonstrates different agent patterns and use cases.

## Agent Patterns

I've implemented two main architectural patterns, each suited for different scenarios:

### Pattern 1: Chat-Supervisor Architecture

This pattern uses a lightweight realtime agent for basic conversation and delegates complex tasks to a more powerful supervisor model. Perfect for scenarios where you want immediate responses but need high intelligence for complex operations.

**How it works:**
- A lightweight chat agent (`gpt-4o-realtime-mini`) handles greetings, basic conversation, and information collection
- Complex queries and tool calls are delegated to a supervisor agent (`gpt-4.1`)
- The chat agent provides immediate feedback while the supervisor processes the request

**Benefits:**
- Natural conversation flow with immediate responses
- High intelligence for complex tasks
- Cost-effective (uses cheaper realtime model for basic tasks)
- Easy migration path from existing text-based agents

**Example Flow:**
```
User: "Why was my bill so high?"
Chat Agent: "Let me check that for you..."
  → Delegates to Supervisor Agent
  → Supervisor calls getUserAccountInfo tool
  → Supervisor formulates response
Chat Agent: "Your last bill was $150, mainly due to..."
```

**Implementation:** See `src/app/agentConfigs/chatSupervisor/`

### Pattern 2: Sequential Agent Handoffs

This pattern uses specialized agents that transfer users between them based on intent. Each agent is an expert in a specific domain, avoiding the performance degradation that comes from loading all instructions and tools into a single agent.

**How it works:**
- Multiple specialized agents, each with focused instructions and tools
- Agents can hand off to other agents via tool calls
- Handoffs are decided by the model based on user intent
- Each handoff updates the session with new instructions and tools

**Benefits:**
- Better performance (specialized agents vs. one-size-fits-all)
- Scalable architecture (add new agents without bloating existing ones)
- Clear separation of concerns
- Natural conversation flow

**Example Flow:**
```
User: "I want to return my snowboard"
Authentication Agent → Authenticates user
  → Hands off to Returns Agent
Returns Agent → Processes return request
  → May escalate to Human Agent if needed
```

**Implementation:** See `src/app/agentConfigs/customerServiceRetail/` and `src/app/agentConfigs/simpleHandoff.ts`

## Project Structure

```
src/
├── app/
│   ├── agentConfigs/          # Agent configurations
│   │   ├── chatSupervisor/    # Chat-supervisor pattern
│   │   ├── customerServiceRetail/  # Multi-agent customer service
│   │   └── simpleHandoff.ts   # Basic handoff example
│   ├── api/                   # Next.js API routes
│   │   ├── session/           # Session token generation
│   │   ├── responses/         # Responses API proxy
│   │   └── health/            # Health check
│   ├── components/            # React components
│   │   ├── Transcript.tsx     # Conversation transcript
│   │   ├── Events.tsx         # Event log viewer
│   │   ├── BottomToolbar.tsx # Audio controls
│   │   └── GuardrailChip.tsx # Guardrail status
│   ├── contexts/              # React contexts
│   │   ├── TranscriptContext.tsx
│   │   └── EventContext.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useRealtimeSession.ts
│   │   ├── useHandleSessionHistory.ts
│   │   └── useAudioDownload.ts
│   ├── lib/                   # Utility functions
│   │   ├── audioUtils.ts
│   │   ├── codecUtils.ts
│   │   └── envSetup.ts
│   ├── builder/               # Visual Agent Builder
│   │   ├── page.tsx           # Builder page
│   │   ├── components/        # Builder UI components
│   │   ├── hooks/             # Builder-specific hooks
│   │   └── utils/             # Agent conversion utilities
│   └── App.tsx               # Main application component
```

## Agent Builder

The platform includes a visual Agent Builder that allows you to create and configure agents without writing code.

### Accessing the Builder

1. Click the **"Agent Builder"** button in the main app header
2. Or navigate directly to [http://localhost:3000/builder](http://localhost:3000/builder)

### Features

- **Visual Agent Configuration** - Configure agent name, voice, and instructions through a form interface
- **Tool Builder** - Define custom tools with parameters using a visual editor
- **Handoff Management** - Configure which agents can transfer to other agents
- **Preview & Export** - Preview agent configuration and export as JSON or TypeScript code
- **Local Storage** - Agents are saved to browser localStorage for persistence
- **Import/Export** - Import and export agent configurations as JSON files

### Building an Agent

1. **Basic Info**: Set the agent name, voice, and handoff description
2. **Instructions**: Write the agent's personality, behavior, and capabilities
3. **Tools**: Define functions the agent can call with their parameters
4. **Handoffs**: Select which other agents this agent can transfer to

### Templates

The builder includes quick-start templates for common agent types:
- Customer Support
- Sales Assistant
- General Helper

### Exporting Agents

The builder can export agents in two formats:
- **JSON**: For import into the builder or other tools
- **TypeScript**: Ready-to-use code for the `agentConfigs` folder

## Creating Custom Agents (Code)

### Basic Agent Structure

```typescript
import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const myAgent = new RealtimeAgent({
  name: 'myAgent',
  voice: 'sage', // Voice selection
  instructions: `
    You are a helpful assistant that...
    [Your agent instructions here]
  `,
  tools: [
    tool({
      name: 'myTool',
      description: 'Tool description',
      parameters: {
        type: 'object',
        properties: {
          param: { type: 'string', description: 'Parameter description' }
        },
        required: ['param']
      },
      execute: async (input) => {
        // Tool implementation
        return { result: 'success' };
      }
    })
  ],
  handoffs: [], // Other agents this agent can hand off to
});
```

### Adding a New Agent Scenario

1. Create your agent configuration file in `src/app/agentConfigs/`
2. Export your agent(s) as an array
3. Register it in `src/app/agentConfigs/index.ts`:

```typescript
import { myAgentScenario } from './myAgent';

export const allAgentSets: Record<string, RealtimeAgent[]> = {
  // ... existing agents
  myAgent: myAgentScenario,
};
```

4. The new scenario will appear in the UI dropdown automatically

### Agent Handoffs

To enable handoffs between agents:

```typescript
export const agentA = new RealtimeAgent({
  name: 'agentA',
  handoffDescription: 'Handles X tasks',
  handoffs: [agentB, agentC], // Can hand off to these agents
  // ...
});

export const agentB = new RealtimeAgent({
  name: 'agentB',
  handoffDescription: 'Handles Y tasks',
  handoffs: [agentA], // Can hand off back to agentA
  // ...
});
```

Agents decide when to hand off based on user intent and their instructions.

## Output Guardrails

The platform includes built-in output guardrails for content moderation. Guardrails check assistant responses before they're displayed to users.

**How it works:**
- When a response starts streaming, it's marked as `IN_PROGRESS`
- Guardrails check the content
- Response is marked as `PASS` or `FAIL` based on safety checks
- Failed responses are blocked from display

**Customization:** See `src/app/agentConfigs/guardrails.ts` and the guardrail logic in `src/app/App.tsx`

## UI Features

### Voice Visualization
- Real-time audio visualization displayed prominently during conversations
- Animated frequency bars with gradient colors
- Volume-based intensity and glow effects
- Microphone status indicator
- Multiple visualization styles available

### Transcript View
- Left panel shows conversation history
- Displays messages, tool calls, and agent changes
- Click to expand tool calls and see details
- Text input for manual messages

### Event Log
- Right panel shows all events
- Client and server events logged
- Click events to see full JSON payload
- Useful for debugging and understanding agent behavior

### Audio Controls
- **Connection Toggle** - Connect/disconnect from the session
- **Push-to-Talk** - Toggle between automatic VAD and manual PTT
- **Audio Playback** - Toggle audio output
- **Codec Selector** - Switch between Opus (48kHz) and PCM (8kHz) for phone quality simulation
- **Logs Toggle** - Show/hide event log panel

## Development

### Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS, Framer Motion
- **AI SDK:** OpenAI Agents SDK
- **Audio:** WebRTC (via OpenAI Realtime API), Web Audio API
- **Icons:** Lucide React
- **Models:** GPT-4o Realtime, GPT-4.1, o4-mini

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)

## Advanced Features

### Codec Selection

The platform supports multiple audio codecs for different use cases:
- **Opus (48kHz)** - High-quality audio (default)
- **PCM (8kHz)** - Phone-quality simulation

Use the codec selector in the UI or add `?codec=opus` or `?codec=pcm` to the URL.

### Audio Recording

Conversations are automatically recorded when connected. Use the download button in the transcript panel to save recordings.

### Session History

Full conversation history is maintained, including:
- User and assistant messages
- Tool calls and responses
- Agent handoffs
- Guardrail events

## Customization Guide

### Modifying Agent Instructions

Edit the `instructions` field in your agent configuration. For voice agents, keep instructions concise and avoid long lists.

### Adding Tools

Use the `tool()` function from `@openai/agents/realtime`:

```typescript
tool({
  name: 'myTool',
  description: 'Clear description of what the tool does',
  parameters: {
    type: 'object',
    properties: {
      // Define parameters
    },
    required: ['param1', 'param2']
  },
  execute: async (input) => {
    // Your tool logic
    return { result: 'data' };
  }
})
```

### State Machines

For complex flows (like authentication), you can prompt agents to follow state machines. See `src/app/agentConfigs/customerServiceRetail/authentication.ts` for an example.

## Troubleshooting

### Connection Issues
- Ensure your OpenAI API key is set correctly
- Check browser console for WebRTC errors
- Verify network connectivity

### Audio Issues
- Check browser permissions for microphone access
- Try different codecs if audio quality is poor
- Ensure audio playback is enabled in controls

### Agent Not Responding
- Check the event log for errors
- Verify agent instructions are valid
- Check tool implementations for errors

## Future Improvements

Planned enhancements:
- [x] Real-time voice visualization
- [ ] Support for additional voice models
- [ ] Enhanced guardrail customization
- [ ] Agent performance analytics
- [ ] Multi-language support
- [ ] Custom voice cloning
- [ ] Advanced tool orchestration patterns
- [ ] 3D avatar integration
- [ ] Emotion detection and visualization

## License

See LICENSE file for details.

## Acknowledgments

Built with:
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-js)
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)

---

Built with ❤️ for exploring the future of voice AI interactions.
