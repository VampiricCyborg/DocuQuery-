# 🧠 DocuQuery

### Enterprise RAG Platform — Intelligent Document Intelligence

> A production-grade, full-stack AI assistant platform for private document fleets — featuring real-time streaming, intelligent document ingestion, vector search, multi-agent orchestration, and voice I/O.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/version-0.3.0-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.13-3776ab?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![pgvector](https://img.shields.io/badge/pgvector-enabled-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

---

## 📖 About the Project

**DocuQuery** is a production-grade, full-stack AI assistant platform built for teams and individuals who need to query, analyze, and interact with private document fleets using state-of-the-art **Retrieval-Augmented Generation (RAG)**.

Unlike generic chatbots, DocuQuery is purpose-built for document intelligence. It combines:

- **Intelligent ingestion** — parse, clean, chunk, embed, and index documents automatically on upload
- **Vector knowledge base** — PostgreSQL + pgvector with HNSW indexing for fast similarity search
- **RAG pipelines** — retrieve grounded answers directly from your own documents _(Phase 4)_
- **Multi-agent orchestration** — route tasks to specialized agents _(Phase 9)_
- **Real-time streaming** — token-by-token AI responses with live typing indicators _(Phase 5)_
- **Multimodal input** — chat, voice, and file uploads in a single interface

---

## 🏗️ Build Status

| Phase | Name | Status |
|---|---|---|
| 1 | Frontend UI | ✅ Complete |
| 2 | Backend Foundation | ✅ Complete |
| 3 | Intelligent Document Ingestion | ✅ Complete |
| 4 | Retrieval Engine | 🔜 Next |
| 5 | LLM Integration | ⏳ Planned |
| 6 | Hybrid Retrieval + BM25 | ⏳ Planned |
| 7 | Reranking | ⏳ Planned |
| 8 | Authentication & RBAC | ⏳ Planned |
| 9 | Agentic RAG | ⏳ Planned |
| 10 | Multimodal RAG | ⏳ Planned |

---

## ✨ Features

| Feature | Description | Status |
|---|---|---|
| 📂 **File Upload** | Drag-and-drop PDF/DOCX/TXT/MD ingestion | ✅ |
| 🔍 **Auto-Indexing** | Parse → clean → chunk → embed → store on upload | ✅ |
| 🧮 **Vector Store** | pgvector HNSW index, 768-dim embeddings | ✅ |
| 📊 **Processing Status** | `uploaded → processing → indexed → failed` lifecycle | ✅ |
| 🔴 **Streaming Chat** | Token-by-token AI responses (UI ready, LLM in Phase 5) | ✅ UI |
| 🤖 **AI Agent Selector** | Switch between specialized agents per conversation | ✅ UI |
| 🎙️ **Voice Input** | Web Speech API with animated waveform | ✅ UI |
| 📌 **Chat Management** | Pin, search, delete, auto-title conversations | ✅ UI |
| 📊 **Usage Dashboard** | Stats, activity feed, file manager | ✅ UI |
| 🔐 **Auth Flow** | Sign in, sign up, forgot-password (JWT in Phase 8) | ✅ UI |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+K` new chat, extensible shortcut system | ✅ |
| 🌙 **Dark UI** | Modern dark-first design, mobile responsive | ✅ |

---

## 🛠️ Tech Stack

### Frontend

| Category | Technology |
|---|---|
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| **Server State** | [TanStack Query v5](https://tanstack.com/query) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **File Upload** | [react-dropzone](https://react-dropzone.js.org/) |
| **Markdown** | [react-markdown](https://remarkjs.github.io/react-markdown/) + remark-gfm |
| **Notifications** | [react-hot-toast](https://react-hot-toast.com/) |

### Backend

| Category | Technology |
|---|---|
| **Framework** | [FastAPI 0.115](https://fastapi.tiangolo.com/) |
| **Language** | [Python 3.13](https://python.org/) |
| **Database** | [PostgreSQL 16](https://postgresql.org/) + [pgvector](https://github.com/pgvector/pgvector) |
| **ORM** | [SQLAlchemy 2 (async)](https://sqlalchemy.org/) |
| **Migrations** | [Alembic](https://alembic.sqlalchemy.org/) |
| **PDF Parsing** | [PyMuPDF](https://pymupdf.readthedocs.io/) |
| **DOCX Parsing** | [python-docx](https://python-docx.readthedocs.io/) |
| **Chunking** | [LangChain Text Splitters](https://python.langchain.com/) |
| **Embeddings** | [SentenceTransformers](https://sbert.net/) — `BAAI/bge-base-en-v1.5` |
| **Containerization** | [Docker](https://docker.com/) + [Docker Compose](https://docs.docker.com/compose/) |
| **Testing** | [pytest](https://pytest.org/) + pytest-asyncio |

---

## 📁 Project Structure

```
DocuQuery/
├── frontend/                   # Next.js 15 App Router
│   ├── app/
│   │   ├── (auth)/             # login, signup, forgot-password
│   │   └── (dashboard)/        # chat, dashboard, files, agents, settings
│   ├── components/             # UI component library
│   ├── stores/                 # Zustand state stores
│   ├── services/               # Mock API service layer
│   └── types/                  # Shared TypeScript types
│
└── backend/                    # FastAPI + Python 3.13
    ├── app/
    │   ├── api/                # Route handlers
    │   │   ├── health.py
    │   │   ├── upload.py       # Upload + triggers ingestion pipeline
    │   │   ├── documents.py    # CRUD + chunk inspector
    │   │   ├── chat.py         # Stub (Phase 5)
    │   │   ├── auth.py         # Stub (Phase 8)
    │   │   └── dependencies.py
    │   ├── core/               # Config, logging, security
    │   ├── database/           # Models, session, base, migrations
    │   ├── ingestion/          # Full ingestion pipeline
    │   │   ├── parser.py       # PDF / DOCX / TXT / MD extraction
    │   │   ├── cleaner.py      # Text normalization
    │   │   ├── chunker.py      # Recursive semantic chunking
    │   │   ├── embeddings.py   # Singleton embedding service
    │   │   ├── vector_store.py # pgvector persistence
    │   │   ├── metadata.py     # Document metadata extraction
    │   │   └── pipeline.py     # Orchestrator
    │   ├── schemas/            # Pydantic request/response models
    │   └── services/           # Business logic
    ├── migrations/             # Alembic migrations
    ├── tests/                  # pytest test suite (19 tests)
    ├── Dockerfile
    ├── docker-compose.yml
    └── requirements.txt
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 20.x` — [Download](https://nodejs.org/)
- **Python** `>= 3.13` — [Download](https://python.org/)
- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop/)
- **Git** — [Download](https://git-scm.com/)

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/login`.

**Demo credentials** (mock mode — no backend required):
```
Email:    madhav@example.com
Password: any string
```

---

### Backend Setup

#### Option A — Docker (recommended)

```bash
cd backend
docker compose up --build
```

On first run, apply the database migrations:

```bash
docker compose exec api python -m alembic upgrade head
```

The API is available at [http://localhost:8000](http://localhost:8000).
Interactive docs at [http://localhost:8000/docs](http://localhost:8000/docs).

#### Option B — Local

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your local PostgreSQL instance

# Apply migrations
python -m alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

---

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# App
APP_NAME=DocuQuery
APP_VERSION=0.1.0
DEBUG=false

# Database (Docker default)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/docuquery

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=50
ALLOWED_EXTENSIONS=pdf,docx,txt,md

# Ingestion
CHUNK_SIZE=800
CHUNK_OVERLAP=120
EMBEDDING_MODEL=BAAI/bge-base-en-v1.5
EMBEDDING_BATCH_SIZE=32
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness + DB connectivity check |
| `POST` | `/upload` | Upload a document — triggers ingestion pipeline |
| `GET` | `/documents` | List all documents with processing status |
| `GET` | `/documents/{id}` | Get a single document by ID |
| `GET` | `/documents/{id}/chunks` | Inspect indexed chunks for a document |
| `DELETE` | `/documents/{id}` | Delete document and all its chunks |
| `POST` | `/chat` | Chat endpoint _(stub — wired in Phase 5)_ |
| `GET` | `/auth/me` | Auth endpoint _(stub — wired in Phase 8)_ |

Full interactive documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔄 Ingestion Pipeline

When a document is uploaded, the following pipeline runs automatically in the background:

```
POST /upload
     │
     ▼
Validate file (type + size)
     │
     ▼
Save to disk  ──►  status: UPLOADED
     │
     ▼  [BackgroundTask]
Parse document
  ├── PDF   → PyMuPDF (page-by-page)
  ├── DOCX  → python-docx
  ├── TXT   → stdlib IO
  └── MD    → stdlib IO (heading-aware)
     │
     ▼  status: PROCESSING
Clean text
  (normalize whitespace, preserve paragraphs + headings)
     │
     ▼
Chunk text
  (RecursiveCharacterTextSplitter, 800 tokens / 120 overlap)
  (each chunk carries: doc_id, filename, page, section, index)
     │
     ▼
Generate embeddings
  (BAAI/bge-base-en-v1.5, 768 dims, batched, singleton)
     │
     ▼
Store vectors
  (PostgreSQL + pgvector, HNSW index, cosine similarity)
     │
     ▼
Update metadata  ──►  status: INDEXED
```

On any failure at any stage: `status: FAILED`

---

## 🗺️ Roadmap

### Frontend
- [ ] Light / dark mode toggle
- [ ] Conversation export (Markdown / PDF)
- [ ] Message search within conversations
- [ ] Rich file preview (PDF viewer, image gallery)
- [ ] Mobile-optimized bottom navigation
- [ ] Accessibility audit (WCAG 2.1 AA)

### Backend & AI
- [x] FastAPI REST backend
- [x] Document upload + CRUD
- [x] Docker Compose full-stack setup
- [x] Document ingestion pipeline (parse, clean, chunk, embed)
- [x] Vector store — PostgreSQL + pgvector + HNSW index
- [x] Alembic migrations
- [ ] **Phase 4** — Retrieval engine (similarity search, top-k, filters)
- [ ] **Phase 5** — LLM integration (OpenAI GPT-4o / Anthropic Claude)
- [ ] **Phase 6** — Hybrid retrieval + BM25
- [ ] **Phase 7** — Reranking (Cohere / cross-encoder)
- [ ] **Phase 8** — JWT authentication + RBAC
- [ ] **Phase 9** — Agentic RAG (Celery task queue, multi-agent orchestration)
- [ ] **Phase 10** — Multimodal RAG (OCR, images, tables)

---

## 🧪 Running Tests

```bash
cd backend
python -m pytest tests/ -v
```

Current test suite: **19 tests, 0 failures**

Covers: text cleaner, document parser (TXT/MD), chunker, metadata extraction, pipeline orchestration (success + failure paths).

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add retrieval endpoint"`
4. Push and open a Pull Request against `main`

**Guidelines:**
- Follow TypeScript strict mode on the frontend
- Follow Python type hints + docstrings on the backend
- Keep components and modules single-responsibility
- Run `npm run build` (frontend) and `pytest` (backend) before opening a PR — zero failures required

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for the full text.

```
MIT License — Copyright (c) 2025 Madhav
```

---

## 🙏 Acknowledgments

- [**Vercel**](https://vercel.com/) — Next.js and the App Router architecture
- [**Radix UI**](https://www.radix-ui.com/) — accessible, unstyled UI primitives
- [**Framer Motion**](https://www.framer.com/motion/) — fluid animation system
- [**shadcn/ui**](https://ui.shadcn.com/) — design system inspiration
- [**Zustand**](https://github.com/pmndrs/zustand) — minimal, scalable state management
- [**pgvector**](https://github.com/pgvector/pgvector) — vector similarity search for PostgreSQL
- [**BAAI**](https://huggingface.co/BAAI/bge-base-en-v1.5) — `bge-base-en-v1.5` embedding model
- [**LangChain**](https://python.langchain.com/) — text splitting utilities
- [**OpenAI**](https://openai.com/) and [**Anthropic**](https://anthropic.com/) — LLM APIs powering the production RAG engine _(Phase 5)_
