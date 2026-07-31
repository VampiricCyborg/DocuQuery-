"use client"
import { useState, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Pin, Trash2, MessageSquare, ChevronLeft, Pencil, Check, X } from "lucide-react"
import { useChatStore } from "@/stores/chat.store"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Tooltip } from "@/components/ui/Tooltip"
import { cn, truncate, generateId } from "@/lib/utils"
import { UserMenu } from "./UserMenu"
import { NavLinks } from "./NavLinks"
import type { Conversation, ChatMode } from "@/types"
import toast from "react-hot-toast"

// ─── Time grouping helpers ────────────────────────────────────────────────────

type Group = "pinned" | "today" | "yesterday" | "week" | "older"

function getGroup(iso: string): Exclude<Group, "pinned"> {
  const diff = Date.now() - new Date(iso).getTime()
  const h = diff / 3_600_000
  if (h < 24) return "today"
  if (h < 48) return "yesterday"
  if (h < 168) return "week"
  return "older"
}

const GROUP_LABELS: Record<Group, string> = {
  pinned: "Pinned",
  today: "Today",
  yesterday: "Yesterday",
  week: "Last 7 Days",
  older: "Older",
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const {
    conversations, activeId, sidebarOpen,
    setActiveId, addConversation, deleteConversation,
    togglePin, toggleSidebar, activeMode,
  } = useChatStore()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q
      ? conversations.filter(c => c.title.toLowerCase().includes(q))
      : conversations
  }, [conversations, search])

  // Partition into groups
  const grouped = useMemo(() => {
    const map: Partial<Record<Group, Conversation[]>> = {}
    for (const c of filtered) {
      const key: Group = c.pinned ? "pinned" : getGroup(c.updatedAt)
      if (!map[key]) map[key] = []
      map[key]!.push(c)
    }
    return map
  }, [filtered])

  const groupOrder: Group[] = ["pinned", "today", "yesterday", "week", "older"]

  const handleNew = () => {
    const conv: Conversation = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      mode: activeMode,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addConversation(conv)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteConversation(id)
    toast.success("Chat deleted")
  }

  const handlePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    togglePin(id)
  }

  if (!sidebarOpen) {
    return (
      <div className="flex h-full w-12 flex-col items-center gap-2 border-r border-neutral-800 bg-neutral-950 py-3">
        <Tooltip content="Expand sidebar" side="right">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        </Tooltip>
        <Tooltip content="New chat" side="right">
          <Button variant="ghost" size="icon" onClick={handleNew}>
            <Plus className="h-4 w-4" />
          </Button>
        </Tooltip>
        <NavLinks collapsed />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 260, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex h-full w-[260px] shrink-0 flex-col border-r border-neutral-800 bg-neutral-950"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-neutral-800">
        <span className="text-sm font-semibold text-white tracking-tight">DocuQuery</span>
        <div className="flex items-center gap-1">
          <Tooltip content="New chat (Ctrl+K)">
            <Button variant="ghost" size="icon" onClick={handleNew}>
              <Plus className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Collapse sidebar">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Nav links */}
      <NavLinks />
      <div className="mx-2 my-1 h-px bg-neutral-800" />

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-neutral-900"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {conversations.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-neutral-600">
            No chats yet.<br />
            <button onClick={handleNew} className="mt-1 text-blue-500 hover:text-blue-400 transition-colors">
              Start a new chat
            </button>
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-neutral-600">No matches for &quot;{search}&quot;</p>
        ) : (
          groupOrder.map(group => {
            const items = grouped[group]
            if (!items?.length) return null
            return (
              <div key={group} className="mb-1">
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                  {GROUP_LABELS[group]}
                </p>
                {items.map(c => (
                  <ConvItem
                    key={c.id}
                    conv={c}
                    active={c.id === activeId}
                    onClick={() => setActiveId(c.id)}
                    onDelete={e => handleDelete(e, c.id)}
                    onPin={e => handlePin(e, c.id)}
                  />
                ))}
              </div>
            )
          })
        )}
      </div>

      <UserMenu />
    </motion.div>
  )
}

// ─── ConvItem ─────────────────────────────────────────────────────────────────

function ConvItem({
  conv, active, onClick, onDelete, onPin,
}: {
  conv: Conversation
  active: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
  onPin: (e: React.MouseEvent) => void
}) {
  const { updateTitle } = useChatStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(conv.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) setTimeout(() => inputRef.current?.select(), 0)
  }, [editing])

  const commitRename = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation()
    const trimmed = draft.trim()
    if (trimmed && trimmed !== conv.title) {
      updateTitle(conv.id, trimmed)
    }
    setEditing(false)
  }

  const cancelRename = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditing(false)
    setDraft(conv.title)
  }

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDraft(conv.title)
    setEditing(true)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "group relative flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors",
        active
          ? "bg-neutral-800 text-white"
          : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
      )}
      onClick={editing ? undefined : onClick}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-neutral-500" />

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") commitRename(e)
                if (e.key === "Escape") cancelRename()
              }}
              className="flex-1 min-w-0 rounded bg-neutral-700 px-1.5 py-0.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button onClick={commitRename} className="text-emerald-400 hover:text-emerald-300 transition-colors">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={cancelRename} className="text-neutral-500 hover:text-neutral-300 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <>
            <p className="truncate text-xs font-medium leading-tight">
              {truncate(conv.title, 28)}
            </p>
            <p className="text-[10px] text-neutral-600 mt-0.5">
              {getRelativeLabel(conv.updatedAt)}
            </p>
          </>
        )}
      </div>

      {/* Hover actions */}
      {!editing && (
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <Tooltip content="Rename" side="top">
            <button
              onClick={handleRenameClick}
              className="p-1 rounded hover:bg-neutral-700 transition-colors"
            >
              <Pencil className="h-3 w-3 text-neutral-500 hover:text-white" />
            </button>
          </Tooltip>
          <Tooltip content={conv.pinned ? "Unpin" : "Pin"} side="top">
            <button onClick={onPin} className="p-1 rounded hover:bg-neutral-700 transition-colors">
              <Pin className={cn("h-3 w-3", conv.pinned ? "text-blue-400" : "text-neutral-500 hover:text-white")} />
            </button>
          </Tooltip>
          <Tooltip content="Delete" side="top">
            <button onClick={onDelete} className="p-1 rounded hover:bg-red-500/20 transition-colors">
              <Trash2 className="h-3 w-3 text-neutral-500 hover:text-red-400" />
            </button>
          </Tooltip>
        </div>
      )}
    </motion.div>
  )
}

function getRelativeLabel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
