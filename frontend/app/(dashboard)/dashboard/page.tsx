"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight, Bot, FileText, MessageSquare,
  Search, Sparkles, Upload, Zap, CheckCircle2, Clock3,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { useFileStore } from "@/stores/file.store"
import { useChatStore } from "@/stores/chat.store"
import { MOCK_CONVERSATIONS } from "@/services/mock"
import { formatRelative, truncate } from "@/lib/utils"
import type { Conversation } from "@/types"

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const { files, loadFiles } = useFileStore()
  const conversations = useChatStore(s => s.conversations)
  const addConversation = useChatStore(s => s.addConversation)
  const activeMode = useChatStore(s => s.activeMode)
  const router = useRouter()

  useEffect(() => { void loadFiles() }, [loadFiles])

  const recentConversations = conversations.length ? conversations : MOCK_CONVERSATIONS
  const recentFiles = files.slice(0, 3)
  const firstName = user?.name?.split(" ")[0] || "there"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"

  const startChat = (mode = activeMode) => {
    const now = new Date().toISOString()
    const conversation: Conversation = {
      id: crypto.randomUUID(), title: "New Chat", messages: [], mode,
      pinned: false, createdAt: now, updatedAt: now,
    }
    addConversation(conversation)
    router.push("/chat")
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,.10),transparent_34%),#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900 to-blue-950/30 p-6 shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="relative">
            <p className="mb-2 text-sm font-medium text-blue-300">Your AI workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{greeting}, {firstName}</h1>
            <p className="mt-2 text-neutral-400">What would you like to do today?</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ActionCard icon={Upload} title="Upload Document" description="Add files to your knowledge base" href="/files" />
              <ActionCard icon={MessageSquare} title="New Chat" description="Start a fresh conversation" onClick={() => startChat()} />
              <ActionCard icon={Sparkles} title="Ask with AI" description="Get grounded, intelligent answers" onClick={() => router.push("/mode-select")} />
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <Panel title="Continue Working" action={<Link href="/chat" className="text-xs text-blue-400 hover:text-blue-300">View chats</Link>}>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15"><FileText className="h-5 w-5 text-blue-300" /></div>
                <div className="min-w-0 flex-1"><p className="truncate font-medium text-white">Assignment 2 DAV.docx</p><p className="mt-1 text-xs text-neutral-500">Last chat: Summarize the assignment</p><p className="mt-2 text-[11px] text-neutral-600">2 minutes ago</p></div>
                <Link href="/chat" className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500">Continue <ArrowRight className="h-3 w-3" /></Link>
              </div>
            </div>
          </Panel>

          <Panel title="Storage">
            <div className="flex items-end justify-between"><div><p className="text-2xl font-semibold text-white">{files.length || 23} <span className="text-sm font-normal text-neutral-500">/ 50 documents</span></p><p className="mt-1 text-xs text-neutral-500">1.8 GB / 5 GB used</p></div><div className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">Healthy</div></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800"><div className="h-full w-[46%] rounded-full bg-gradient-to-r from-blue-500 to-purple-500" /></div>
            <div className="mt-5 grid grid-cols-2 gap-3"><MiniStat icon={Zap} label="Current mode" value={activeMode === "docuquery" ? "DocuQuery" : activeMode === "llm" ? "General AI" : "Hybrid"} /><MiniStat icon={CheckCircle2} label="Indexing status" value="All systems ready" /></div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Recent Documents" action={<Link href="/files" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">View all <ArrowRight className="h-3 w-3" /></Link>}>
            <div className="space-y-2">{(recentFiles.length ? recentFiles : [
              { id: "dav", name: "DAV.docx", status: "ready" }, { id: "research", name: "ResearchPaper.pdf", status: "ready" }, { id: "resume", name: "Resume.pdf", status: "processing" },
            ]).map(file => <DocumentRow key={file.id} name={file.name} status={file.status === "ready" ? "Indexed" : "Processing..."} />)}</div>
          </Panel>
          <Panel title="Recent Conversations" action={<Link href="/chat" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">View all <ArrowRight className="h-3 w-3" /></Link>}>
            <div className="space-y-1">{recentConversations.slice(0, 4).map(c => <Link key={c.id} href={`/chat/${c.id}`} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-800"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10"><MessageSquare className="h-4 w-4 text-purple-300" /></div><span className="flex-1 truncate text-sm text-neutral-300">{truncate(c.title, 40)}</span><span className="text-[11px] text-neutral-600">{formatRelative(c.updatedAt)}</span></Link>)}</div>
          </Panel>
        </div>

        <Panel title="Quick Actions">
          <div className="grid gap-3 sm:grid-cols-4"><QuickAction icon={Upload} label="Upload File" href="/files" /><QuickAction icon={Sparkles} label="Start Hybrid Chat" onClick={() => router.push("/mode-select")} /><QuickAction icon={Search} label="Ask Documents" onClick={() => startChat("docuquery")} /><QuickAction icon={Bot} label="General AI Chat" onClick={() => startChat("llm")} /></div>
        </Panel>
      </div>
    </div>
  )
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl shadow-black/10"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-white">{title}</h2>{action}</div>{children}</section> }
function ActionCard({ icon: Icon, title, description, href, onClick }: { icon: typeof Upload; title: string; description: string; href?: string; onClick?: () => void }) { const body = <><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Icon className="h-5 w-5 text-blue-200" /></div><div className="mt-4 text-left"><p className="font-medium text-white">{title}</p><p className="mt-1 text-xs text-neutral-500">{description}</p></div><ArrowRight className="absolute right-4 top-4 h-4 w-4 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-blue-300" /></>; return href ? <Link href={href} className="group relative rounded-2xl border border-neutral-700/70 bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-blue-500/[0.07]">{body}</Link> : <button onClick={onClick} className="group relative rounded-2xl border border-neutral-700/70 bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-blue-500/[0.07]">{body}</button> }
function DocumentRow({ name, status }: { name: string; status: string }) { const ready = status === "Indexed"; return <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-neutral-800"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800"><FileText className="h-4 w-4 text-blue-300" /></div><span className="flex-1 truncate text-sm text-neutral-300">{name}</span><span className={`flex items-center gap-1.5 text-xs ${ready ? "text-emerald-300" : "text-amber-300"}`}>{ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{status}</span></div> }
function QuickAction({ icon: Icon, label, href, onClick }: { icon: typeof Upload; label: string; href?: string; onClick?: () => void }) { const body = <><Icon className="h-4 w-4 text-blue-300" /><span>{label}</span><ArrowRight className="ml-auto h-3.5 w-3.5 text-neutral-600" /></>; return href ? <Link href={href} className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/50 p-3 text-xs text-neutral-300 hover:border-blue-500/40 hover:text-white">{body}</Link> : <button onClick={onClick} className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/50 p-3 text-left text-xs text-neutral-300 hover:border-blue-500/40 hover:text-white">{body}</button> }
function MiniStat({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) { return <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-3"><div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><Icon className="h-3.5 w-3.5 text-blue-300" />{label}</div><p className="mt-2 text-xs font-medium text-neutral-200">{value}</p></div> }
