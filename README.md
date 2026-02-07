# anthropair

**Pair-program with Claude, share your screen with a friend.**

A local dashboard that wraps the Claude Code SDK for AI-assisted coding and adds LiveKit-powered screen sharing — all in one browser tab.

```bash
npx anthropair
```

---

## Features

### 🤖 AI Agent Chat
Conversational coding assistant powered by the Claude Code SDK. Streaming responses, session resumption, and per-message cost tracking so you always know what you're spending.

### 📁 File Browser
Lazy-loaded directory tree rooted in your working directory. Respects `.gitignore` automatically — click any file to view or send it as context to the agent.

### 📺 Screen Sharing
WebRTC screen sharing via LiveKit. Generate a room code, share it with a collaborator, and they see your screen in real time. Optional PiP webcam overlay included.

### ⚡ Quick Actions
Pre-built task buttons to skip the prompt writing:
**Explain** · **Fix Bug** · **Refactor** · **Write Tests** · **Code Review** · **Custom**

### ✅ Task Queue
Every tool call the agent wants to make lands in an approval queue first. Approve or reject each operation before it runs. Multi-client broadcast keeps all connected browsers in sync.

### 🔒 Permission System
Tool-level approve/deny controls so the agent only touches what you allow. Review each action before it executes — no surprises.

### ⚙️ Settings
In-browser configuration panel. Manage environment variables, toggle features, and update secrets — values are masked by default.

---

## Getting Started

### 1. Run it

```bash
npx anthropair
```

Or clone and run locally:

```bash
git clone <repo-url>
cd anthropair
npm install
npm run dev
```

### 2. Set environment variables

Create a `.env` file (or configure in the Settings panel):

```env
ANTHROPIC_API_KEY=sk-ant-...
```

Screen sharing is optional — it works without LiveKit keys.

### 3. Open the dashboard

Navigate to [http://localhost:3000](http://localhost:3000) and start coding.

---

## Configuration

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `PORT` | No | Server port (default `3000`) |
| `CLAUDE_MODEL` | No | Model override (default: SDK default) |
| `LIVEKIT_API_KEY` | No | LiveKit API key for screen sharing |
| `LIVEKIT_API_SECRET` | No | LiveKit API secret |
| `LIVEKIT_WS_URL` | No | LiveKit WebSocket URL (`wss://your-app.livekit.cloud`) |

---

## Tech Stack

- **Backend** — Express, WebSocket (`ws`), Claude Code SDK
- **Frontend** — Vanilla JS, CSS Grid, Vite
- **Screen Sharing** — LiveKit (client + server SDK)
