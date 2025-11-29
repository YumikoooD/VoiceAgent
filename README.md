# Voice Agent Platform

> Build and deploy intelligent voice agents with real-time conversations, multi-agent orchestration, and seamless integrations.

![Voice Chat Interface](/public/screenshot_chat.png)

## ✨ Features

- **🎙️ Real-time Voice** — Low-latency conversations powered by WebRTC and OpenAI's Realtime API
- **🌊 Live Visualization** — Beautiful, reactive audio visualization that responds to your voice
- **🤖 Multi-Agent System** — Specialized agents that hand off conversations intelligently
- **🛠️ Visual Agent Builder** — Create custom agents without writing code
- **📧 Gmail Integration** — Connect your Gmail for email-capable agents (OAuth2)
- **🛡️ Safety Guardrails** — Built-in content moderation and safety checks

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <your-repo>
cd VoiceAgent
npm install

# Configure
echo "OPENAI_API_KEY=your_key_here" > .env

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the Agent Builder.

---

## 📸 Screenshots

### Agent Builder Dashboard

Browse built-in scenarios or create your own custom agents. Each card shows the agent's capabilities at a glance.

![Agent Builder](/public/screenshot_builder.png)

### Agent Editor

Configure every aspect of your agent: identity, voice persona, instructions, tools, and handoffs.

![Agent Editor](/public/screenshot_editor.png)

### Voice Chat Interface

Engage in real-time voice conversations with your agents. The visualizer reacts to speech in real-time.

![Voice Chat](/public/screenshot_chat.png)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Voice Agent Platform                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Builder   │  │    Chat     │  │   Agent Configs     │  │
│  │   /builder  │  │    /chat    │  │   (Scenarios)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              OpenAI Realtime API (WebRTC)           │    │
│  │         gpt-4o-realtime  |  gpt-4o-realtime-mini    │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Gmail   │  │ Calendar │  │  Custom  │  │  Tools   │    │
│  │   API    │  │   API    │  │   APIs   │  │ Library  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Built-in Demo Agents

| Agent | Description |
|-------|-------------|
| **🎧 Customer Support** | Multi-tier support with agent handoffs and escalation |
| **🎯 Personal Coach** | Motivational coach for goals, productivity, and growth |

---

## 🛠️ Agent Builder

Create agents visually without writing code:

1. **Identity** — Name your agent and choose a voice persona
2. **Instructions** — Define personality, behavior, and capabilities
3. **Tools** — Add capabilities like Gmail, Calendar, or custom functions
4. **Handoffs** — Configure which agents can transfer to others

### Adding Integrations

Click **"Add Capability"** in the Tools tab to add pre-built integrations:

- **📧 Gmail** — Read, send, delete emails and create drafts
- **📅 Calendar** — List events and schedule meetings (coming soon)

---

## 📧 Gmail Integration

Enable your agents to manage emails with real Gmail OAuth2:

### Setup

1. Create a project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Gmail API**
3. Create **OAuth2 credentials** (Web application)
4. Add redirect URI: `http://localhost:3000/api/gmail/callback`
5. Add to `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

6. In Agent Builder, add Gmail tools → Click **"Connect Gmail"**

---

## 🎨 Customization

### Creating Agents via Code

```typescript
import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const myAgent = new RealtimeAgent({
  name: 'myAgent',
  voice: 'sage',
  instructions: `You are a helpful assistant...`,
  tools: [
    tool({
      name: 'myTool',
      description: 'Does something useful',
      parameters: { type: 'object', properties: {}, required: [] },
      execute: async (input) => ({ success: true })
    })
  ],
  handoffs: []
});
```

### Voice Options

| Voice | Style |
|-------|-------|
| `sage` | Calm and wise |
| `alloy` | Neutral and balanced |
| `echo` | Soft and reflective |
| `fable` | Warm and narrative |
| `onyx` | Deep and authoritative |
| `shimmer` | Bright and energetic |

---

## 📁 Project Structure

```
src/app/
├── builder/           # Visual Agent Builder
│   ├── components/    # Builder UI components
│   └── hooks/         # Builder state management
├── agentConfigs/      # Built-in agent scenarios
│   ├── chatSupervisor/
│   ├── customerServiceRetail/
│   └── simpleHandoff.ts
├── components/        # Shared UI components
├── hooks/             # React hooks
├── api/               # API routes
│   ├── session/       # OpenAI session tokens
│   └── gmail/         # Gmail OAuth & proxy
└── App.tsx            # Main chat interface
```

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth client ID | (FOR GMAIL ONLY)
| `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth client secret | (FOR GMAIL ONLY)
| `NEXT_PUBLIC_APP_URL` | ❌ | App URL for OAuth redirects | (FOR GMAIL ONLY)

---

## 🛡️ Tech Stack

- **Framework:** Next.js 15, React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **AI:** OpenAI Agents SDK, Realtime API
- **Audio:** WebRTC, Web Audio API
- **Icons:** Lucide React

---

## 📜 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
```

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---