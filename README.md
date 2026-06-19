# 🧠 DocuQuery

### Real-Time Multimodal RAG Agent Platform

> An enterprise-grade AI assistant platform for private document fleets — featuring real-time streaming, multi-agent orchestration, voice I/O, and multimodal file understanding.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

---

## 📖 About the Project

**DocuQuery** is a production-grade, full-stack AI assistant platform built for teams and individuals who need to query, analyze, and interact with private document fleets using state-of-the-art **Retrieval-Augmented Generation (RAG)**.

Unlike generic chatbots, DocuQuery is purpose-built for document intelligence. It combines:

- **RAG pipelines** — retrieve grounded answers directly from your own documents
- **Multi-agent orchestration** — route tasks to specialized agents (DocuQuery, Web Search, Code Assistant, Data Analyst)
- **Real-time streaming** — token-by-token AI responses with live typing indicators
- **Multimodal input** — chat, voice, and file uploads (PDF, DOCX, TXT, images) in a single interface

### ✨ Core Features

| Feature | Description |
|---|---|
| 🔴 **Streaming Chat** | Token-by-token AI responses via async generator streaming |
| 📂 **File Upload & RAG** | Drag-and-drop PDF/DOCX/TXT/image ingestion with upload progress |
| 🤖 **AI Agent Selector** | Switch between specialized agents per conversation |
| 🎙️ **Voice Input** | Web Speech API with animated waveform and speech-to-text |
| 📌 **Chat Management** | Pin, search, delete, and auto-title conversation history |
| 📊 **Usage Dashboard** | Real-time usage stats, activity feed, and file manager |
| 🔐 **Auth Flow** | Sign in, sign up, and forgot-password with route protection |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+K` for new chat; extensible shortcut system |
| 🌙 **Dark UI** | Modern dark-first design, mobile responsive |
| 🔁 **Retry & Copy** | Retry last AI response or copy any message to clipboard |

---

## 🛠️ Built With

### Frontend

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) (Dialog, Dropdown, Tooltip, Avatar, Scroll Area) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| **Server State** | [TanStack Query v5](https://tanstack.com/query) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **File Upload** | [react-dropzone](https://react-dropzone.js.org/) |
| **Markdown Rendering** | [react-markdown](https://remarkjs.github.io/react-markdown/) + [remark-gfm](https://github.com/remarkjs/remark-gfm) |
| **Notifications** | [react-hot-toast](https://react-hot-toast.com/) |
| **Variant Styling** | [class-variance-authority](https://cva.style/) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) |

### Backend _(in progress)_

| Category | Technology |
|---|---|
| **Runtime** | [Python 3.13+](https://python.org/) |
| **Package Manager** | [uv](https://docs.astral.sh/uv/) |
| **RAG Framework** | _(planned — LangChain / LlamaIndex)_ |
| **Vector Store** | _(planned — Pinecone / Chroma / Weaviate)_ |
| **LLM** | _(planned — OpenAI GPT-4o / Anthropic Claude)_ |

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed on your system:

- **Node.js** `>= 20.x` — [Download](https://nodejs.org/)
- **npm** `>= 10.x` (bundled with Node.js)
- **Python** `>= 3.13` — [Download](https://python.org/) _(for backend)_
- **uv** _(Python package manager)_ — [Install](https://docs.astral.sh/uv/getting-started/installation/)
- **Git** — [Download](https://git-scm.com/)

Verify your environment:

```bash
node --version    # v20.x or higher
npm --version     # 10.x or higher
python --version  # 3.13 or higher
uv --version      # any recent version
```

---

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/DocuQuery.git
cd DocuQuery
```

#### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

#### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open **`.env.local`** and configure your keys:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Provider (when backend is connected)
OPENAI_API_KEY=sk-<your-openai-key>

# Vector Store (when RAG backend is connected)
PINECONE_API_KEY=<your-pinecone-key>
PINECONE_INDEX=<your-index-name>
```

> ⚠️ **Note:** The frontend runs fully on **mock APIs** out of the box. No real API keys are required to explore the UI.

#### 4. _(Optional)_ Set up the Python backend

```bash
# From project root
uv sync
uv run main.py
```

---

## 💻 Usage

### Start the development server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The root route **automatically redirects** to `/login`.

---

### Default demo login

The frontend ships with a pre-configured mock user for instant access:

```
Email:    madhav@example.com
Password: password   (any string works in mock mode)
```

Click **Sign in** — you'll land on the `/chat` page immediately.

---

### App routes

| Route | Description |
|---|---|
| `/login` | Authentication — Sign in |
| `/signup` | Authentication — Create account |
| `/forgot-password` | Authentication — Reset password |
| `/chat` | Main AI chat interface |
| `/chat/[id]` | Specific conversation by ID |
| `/dashboard` | Usage statistics and activity feed |
| `/files` | File upload and document management |
| `/agents` | AI agent selection and status |
| `/settings` | User profile and API key configuration |

---

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + K` | Create a new chat |
| `Enter` | Send message |
| `Shift + Enter` | Insert newline in message input |

---

### Production build

```bash
cd frontend
npm run build
npm run start
```

---

## 🗺️ Roadmap

### Frontend
- [ ] Light / dark mode toggle with `next-themes`
- [ ] Conversation export (Markdown / PDF)
- [ ] Message search within conversations
- [ ] Drag-to-reorder pinned chats
- [ ] Rich file preview (PDF viewer, image gallery)
- [ ] Mobile-optimized bottom navigation
- [ ] Accessibility audit (WCAG 2.1 AA)

### Backend & AI
- [ ] FastAPI REST + WebSocket streaming backend
- [ ] Document ingestion pipeline (chunking + embedding)
- [ ] Vector store integration (Pinecone / Chroma / Weaviate)
- [ ] OpenAI GPT-4o and Anthropic Claude adapter
- [ ] LangChain / LlamaIndex RAG pipeline
- [ ] Multi-agent orchestration framework
- [ ] Voice output (Text-to-Speech playback)
- [ ] JWT-based authentication with refresh tokens
- [ ] PostgreSQL session and user management
- [ ] Docker Compose full-stack setup
- [ ] CI/CD pipeline (GitHub Actions)

---

## 🤝 Contributing

Contributions are what make open-source thrive. Any improvements are **greatly appreciated**.

#### Workflow

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with a conventional commit message
   ```bash
   git commit -m "feat: add voice output with TTS playback"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch

#### Guidelines

- Follow the existing **TypeScript strict** coding style
- Keep components **modular and single-responsibility**
- Write **descriptive PR descriptions** explaining what and why
- Do not break existing type contracts in `types/index.ts`
- Run `npm run build` locally before opening a PR — zero build errors required

---

## 📄 License

Distributed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Madhav

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

See [`LICENSE`](./LICENSE) for the full text.

---

## 🙏 Acknowledgments

- [**Vercel**](https://vercel.com/) — for Next.js and the App Router architecture
- [**Radix UI**](https://www.radix-ui.com/) — accessible, unstyled primitives that made the component system possible
- [**Framer Motion**](https://www.framer.com/motion/) — for the fluid animation system
- [**shadcn/ui**](https://ui.shadcn.com/) — design system patterns and component architecture inspiration
- [**Zustand**](https://github.com/pmndrs/zustand) — for the simplest, most scalable state management in React
- [**TanStack Query**](https://tanstack.com/query) — for clean async server state
- [**OpenAI**](https://openai.com/) and [**Anthropic**](https://anthropic.com/) — for the LLM APIs that will power the production RAG engine
- [**ChatGPT**](https://chat.openai.com/), [**Claude**](https://claude.ai/), [**Perplexity**](https://perplexity.ai/), [**Cursor**](https://cursor.sh/) — UI/UX inspiration for the chat interface design language

----
