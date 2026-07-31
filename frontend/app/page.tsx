"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileText, MessageSquare, BookOpen, Zap, ArrowRight,
  Upload, Search, Sparkles, ExternalLink, Shield, Check
} from "lucide-react"

// ─── Hero Product Preview ─────────────────────────────────────────────────────

function ProductPreview() {
  return (
    <div className="relative w-full max-w-lg">
      {/* Glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent blur-3xl" />

      {/* Main chat card */}
      <div className="relative rounded-2xl border border-neutral-700/60 bg-neutral-900/80 shadow-2xl shadow-blue-900/20 backdrop-blur-sm overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-0.5 text-[11px] text-neutral-400">
              DocuQuery — AI Document Chat
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-sm text-white">
              What are the key findings in the Q3 report?
            </div>
          </div>

          {/* AI message */}
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xs">
              ✦
            </div>
            <div className="max-w-[85%] space-y-2">
              <div className="rounded-2xl rounded-tl-sm border border-neutral-700/40 bg-neutral-800/70 px-4 py-2.5 text-sm text-neutral-200 leading-relaxed">
                Based on the Q3 report, the key findings include:
                <ul className="mt-2 space-y-1 text-xs text-neutral-300">
                  <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span> Revenue grew 23% YoY to $4.2M</li>
                  <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span> Customer acquisition cost decreased by 18%</li>
                  <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span> Net Promoter Score improved to 72</li>
                </ul>
              </div>

              {/* Citation card */}
              <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/40 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                    <FileText className="h-3 w-3 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-200">Q3_Report_2024.pdf</p>
                    <p className="text-[10px] text-neutral-500">Page 7 · Chunks 12 · 14</p>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-medium">Sources</div>
                </div>
              </div>
            </div>
          </div>

          {/* Files indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-800/40 px-3 py-2">
            <div className="flex -space-x-1">
              {["pdf", "docx", "txt"].map(t => (
                <div key={t} className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-[9px] font-bold text-neutral-400 uppercase">
                  {t}
                </div>
              ))}
            </div>
            <span className="text-xs text-neutral-400">3 documents indexed</span>
            <div className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
        </div>
      </div>

      {/* Floating stats */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute -left-10 top-24 rounded-xl border border-neutral-700/50 bg-neutral-900/90 px-3 py-2 shadow-xl backdrop-blur-sm"
      >
        <p className="text-[10px] text-neutral-500">Response time</p>
        <p className="text-sm font-bold text-white">~0.8s</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute -right-6 bottom-24 rounded-xl border border-neutral-700/50 bg-neutral-900/90 px-3 py-2 shadow-xl backdrop-blur-sm"
      >
        <p className="text-[10px] text-neutral-500">Accuracy</p>
        <p className="text-sm font-bold text-emerald-400">Grounded ✓</p>
      </motion.div>
    </div>
  )
}

// ─── Features Section ─────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Document Chat",
    description: "Ask questions about your uploaded documents. Receive grounded answers with citations linking back to the exact source page and chunk.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: BookOpen,
    title: "Persistent Conversations",
    description: "Every conversation is automatically saved with full history. Continue exactly where you left off — across sessions, across devices.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: Zap,
    title: "Hybrid AI",
    description: "Combine vector retrieval from your documents with powerful LLM reasoning. Get the best of both worlds in every response.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
]

// ─── Workflow Section ─────────────────────────────────────────────────────────

const WORKFLOW = [
  { icon: Upload, label: "Upload", desc: "PDF, DOCX, TXT, MD", color: "from-blue-600 to-blue-700" },
  { icon: Zap, label: "Index", desc: "Auto-embed & store", color: "from-purple-600 to-purple-700" },
  { icon: Search, label: "Ask", desc: "Natural language query", color: "from-violet-600 to-violet-700" },
  { icon: Sparkles, label: "Answer", desc: "Grounded + cited", color: "from-emerald-600 to-emerald-700" },
]

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-900/30">
              <span className="text-sm font-bold">✦</span>
            </div>
            <span className="text-sm font-bold tracking-tight">DocuQuery</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6" aria-label="Hero">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6 lg:max-w-xl"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-medium text-blue-300">RAG-Powered Document Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                Understand your{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  documents
                </span>{" "}
                with AI.
              </h1>

              <p className="text-lg text-neutral-400 leading-relaxed">
                Upload PDFs, DOCX, TXT and more. Ask questions naturally.
                Receive grounded answers with citations — powered by
                Retrieval Augmented Generation.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 hover:bg-blue-500 transition-all hover:shadow-blue-800/40 hover:shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-6 py-3 text-sm font-medium text-neutral-300 hover:border-neutral-500 hover:text-white transition-all"
                >
                  Sign In
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {[
                  { icon: Shield, text: "Private & Secure" },
                  { icon: Zap, text: "Real-time Streaming" },
                  { icon: Check, text: "Grounded Answers" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Icon className="h-3.5 w-3.5 text-neutral-600" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: product preview */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="w-full max-w-md lg:max-w-none lg:flex-1 flex justify-center"
            >
              <ProductPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6 border-t border-neutral-800/50" aria-label="Features">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Everything you need for document intelligence
            </h2>
            <p className="mt-3 text-neutral-400">
              Built for teams and individuals who need to query, analyze, and interact with private document fleets.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description, color, bg, border }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border ${border} bg-neutral-900/60 p-6 hover:bg-neutral-900 transition-colors`}
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section className="py-20 px-6 bg-neutral-900/30" aria-label="How it works">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How it works</h2>
            <p className="mt-3 text-neutral-400">From upload to answer in seconds</p>
          </motion.div>

          <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-0">
            {WORKFLOW.map(({ icon: Icon, label, desc, color }, i) => (
              <div key={label} className="flex flex-col sm:flex-row items-center flex-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-neutral-500">{desc}</p>
                  </div>
                </motion.div>
                {i < WORKFLOW.length - 1 && (
                  <div className="hidden sm:flex flex-1 items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-neutral-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6" aria-label="Call to action">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-neutral-700/50 bg-gradient-to-br from-blue-900/20 via-neutral-900 to-purple-900/20 p-10 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl shadow-blue-900/30">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Ready to query your documents with AI?
              </h2>
              <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                Upload your first document and get grounded, cited answers in seconds.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 hover:bg-blue-500 transition-all"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-800 py-10 px-6" role="contentinfo">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <span className="text-xs font-bold">✦</span>
              </div>
              <span className="text-sm font-semibold text-neutral-300">DocuQuery</span>
              <span className="text-neutral-700 text-xs">·</span>
              <span className="text-xs text-neutral-600">Enterprise RAG Platform</span>
            </div>
            <nav className="flex items-center gap-6" aria-label="Footer navigation">
              {[
                { href: "https://github.com", label: "GitHub", icon: ExternalLink },
                { href: "#", label: "Documentation" },
                { href: "#", label: "Privacy" },
                { href: "#", label: "About" },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-6 pt-6 border-t border-neutral-800/50 text-center text-xs text-neutral-700">
            © {new Date().getFullYear()} DocuQuery. Built with Next.js, FastAPI, pgvector, and Groq.
          </div>
        </div>
      </footer>
    </main>
  )
}
