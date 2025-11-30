# Voice Agent Platform

> Build and deploy intelligent voice agents with real-time conversations, a visual agent builder, and Gmail/Calendar + webhook integrations.

![Voice Chat Interface](/public/screenshot_chat.png)

---

## ✨ What You Get

- **🎙️ Realtime voice** – Low‑latency conversations over WebRTC using OpenAI Realtime
- **🌊 Voice visualizer** – Minimal, cinematic visual feedback that reacts to speech
- **🧱 Visual Agent Builder** – Create and manage agents without touching code
- **🤝 Multi‑agent orchestration** – Scenario agents with smart handoffs
- **📧 Gmail + 📅 Calendar** – Read/send emails and manage events via Google OAuth2
- **🔗 Webhook tools** – Connect agents to any external API via configurable webhooks

---

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone <your-repo-url>
cd VoiceAgent
npm install

# 2. Configure OpenAI
echo "OPENAI_API_KEY=sk-..." > .env

# 3. Run the app
npm run dev
```

Open `http://localhost:3000` – you’ll land directly on the **Agent Builder**.

---

## 📸 Screenshots

### Builder – Agents Overview

Clean grid of scenario and custom agents with capabilities at a glance.

![Agent Builder](/public/screenshot_builder.png)

### Builder – Agent Editor

Edit identity, voice, instructions, tools, and handoffs in a single minimalist layout.

![Agent Editor](/public/screenshot_editor.png)

### Realtime Voice Chat

Talk to your agents with a smooth, reactive visualizer and instant responses.

![Voice Chat](/public/screenshot_chat.png)

---

## 🏗️ High‑Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Voice Agent Platform                   │
├─────────────────────────────────────────────────────────────┤
│  Web UI (Next.js App Router)                               │
│  - /builder  → Visual Agent Builder                        │
│  - /chat     → Realtime voice interface                    │
├─────────────────────────────────────────────────────────────┤
│  OpenAI Realtime (WebRTC)                                  │
│  - gpt-4o-realtime / gpt-4o-realtime-mini                  │
├─────────────────────────────────────────────────────────────┤
│  Backend Integrations                                      │
│  - /api/gmail/*     → Gmail OAuth + proxy                  │
│  - /api/calendar/*  → Google Calendar proxy                │
│  - /api/webhook/*   → Generic webhook proxy for tools      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Agent Builder – How It Works

Every agent you create has:

1. **Identity** – Name + voice (`sage`, `alloy`, `echo`, `fable`, `onyx`, `shimmer`)
2. **Instructions** – Personality, behavior, and capabilities in natural language
3. **Tools** – Function tools the model can call (Gmail, Calendar, or custom)
4. **Handoffs** – Optional transfers to other scenario agents

The builder stores configs in `localStorage` and exposes them to the chat app via a `useCustomAgents` hook, which converts them into OpenAI `RealtimeAgent` instances at runtime.

---

## ✨ AI Agent Generator

From the Builder, you can generate a full agent from a single prompt:

```text
"Snowboard shop assistant that helps customers find gear and book lessons"
```

The generator creates:
- Name + voice
- Rich instructions and tone
- Suggested tools (e.g. `check_inventory`, `book_lesson`)

You can then refine everything manually in the editor.

---

## 🔌 Integrations

### Gmail + Calendar (Google OAuth2)

Agents can:
- List unread emails, read specific messages, send and delete mail, create drafts
- List upcoming events and create/update/delete events on your primary calendar

#### Configure Google Cloud

1. Go to **Google Cloud Console** → *APIs & Services* → *Credentials*
2. Create an **OAuth 2.0 Client ID** (Application type: *Web application*)
3. Add **Authorized redirect URIs**:

   ```text
   http://localhost:3000/api/gmail/callback
   ```

   Or, if you run behind a different URL:

   ```text
   https://your-domain.com/api/gmail/callback
   ```

4. In your `.env`:

   ```env
   OPENAI_API_KEY=sk-...
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Restart `npm run dev`.
6. In the Builder, add **Gmail** or **Calendar** tools, then click **Connect Google** in the Tools tab.

Behind the scenes:
- Frontend gets an OAuth URL from `/api/gmail/auth`
- Google redirects back to `/api/gmail/callback`
- Access token is stored client‑side and used by:
  - `/api/gmail/proxy` for Gmail calls
  - `/api/calendar/proxy` for Calendar calls

### Webhook Tools (Custom APIs)

For any custom tool, you can optionally configure:
- **Webhook URL** – e.g. `https://api.yourdomain.com/agent-tools/order_status`
- **HTTP method** – `GET`, `POST`, `PUT`, `DELETE`

When the model calls the tool:
- The builder runtime sends the call to `/api/webhook/proxy`
- This proxy validates and forwards the request to your external API
- The JSON (or text) response is passed back to the model

If no webhook is configured, the tool returns a stub response (useful during design).

---

## 📁 Project Structure (Simplified)

```text
src/app/
├── builder/             # Visual Agent Builder
│   ├── components/      # Builder UI (AgentForm, AgentList, ToolBuilder...)
│   ├── hooks/           # Builder state + Gmail auth + storage
│   └── toolLibrary.ts   # Prebuilt Gmail/Calendar/Webhook tool templates
├── agentConfigs/        # Built‑in scenario agents
├── api/                 # Next.js API routes
│   ├── gmail/           # OAuth + Gmail proxy
│   ├── calendar/        # Google Calendar proxy
│   ├── webhook/         # Generic webhook proxy for tools
│   └── session/         # OpenAI Realtime session handling
├── chat/                # Realtime voice chat page
└── App.tsx              # Root app shell
```

---

## 🔧 Environment Variables

| Variable                | Required | Purpose                                   |
|-------------------------|----------|-------------------------------------------|
| `OPENAI_API_KEY`       | ✅       | OpenAI API key for Realtime + Agents SDK  |
| `GOOGLE_CLIENT_ID`     | ⚙️       | Google OAuth client ID (Gmail/Calendar)   |
| `GOOGLE_CLIENT_SECRET` | ⚙️       | Google OAuth client secret                |
| `NEXT_PUBLIC_APP_URL`  | ⚙️       | Public app URL for OAuth redirects        |

> You **do not** commit `.env` to Git – keep it local or in your secret manager.

---

## 🧰 Tech Stack

- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript
- **UI**: Tailwind CSS, Framer Motion, Lucide Icons
- **AI**: OpenAI Agents SDK, Realtime API (WebRTC)
- **Audio**: WebRTC, Web Audio API

---

## 📜 NPM Scripts

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

---

## 📄 License

MIT License — see `LICENSE` for full text.

---