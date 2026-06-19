"use client"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Pin, Trash2, MessageSquare, ChevronLeft } from "lucide-react"
import { useChatStore } from "@/stores/chat.store"
import { chatService } from "@/services/mock"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { SidebarSkeleton } from "@/components/ui/Skeleton"
import { Tooltip } from "@/components/ui/Tooltip"
import { cn, truncate, formatRelative } from "@/lib/utils"
import { UserMenu } from "./UserMenu"
import { NavLinks } from "./NavLinks"
import toast from "react-hot-toast"

export function Sidebar() {
  const { conversations, activeId, sidebarOpen, setActiveId, addConversation, deleteConversation, togglePin, toggleSidebar } = useChatStore()
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return conversations.filter(c => c.title.toLowerCase().includes(q))
  }, [conversations, search])

  const pinned = filtered.filter(c => c.pinned)
  const recent = filtered.filter(c => !c.pinned)

  const handleNew = async () => {
    setLoading(true)
    const conv = await chatService.createConversation()
    addConversation(conv)
    setLoading(false)
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
        <span className="text-sm font-semibold text-white">DocuQuery</span>
        <div className="flex items-center gap-1">
          <Tooltip content="New chat (Ctrl+K)">
            <Button variant="ghost" size="icon" onClick={handleNew} disabled={loading}>
              <Plus className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Collapse">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Nav */}
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
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {loading ? <SidebarSkeleton /> : (
          <>
            {pinned.length > 0 && (
              <Section label="Pinned">
                {pinned.map(c => (
                  <ConvItem key={c.id} conv={c} active={c.id === activeId}
                    onClick={() => setActiveId(c.id)}
                    onDelete={e => handleDelete(e, c.id)}
                    onPin={e => handlePin(e, c.id)}
                  />
                ))}
              </Section>
            )}
            <Section label={pinned.length > 0 ? "Recent" : undefined}>
              {recent.length === 0 && !pinned.length ? (
                <p className="px-2 py-4 text-center text-xs text-neutral-600">No chats yet</p>
              ) : (
                recent.map(c => (
                  <ConvItem key={c.id} conv={c} active={c.id === activeId}
                    onClick={() => setActiveId(c.id)}
                    onDelete={e => handleDelete(e, c.id)}
                    onPin={e => handlePin(e, c.id)}
                  />
                ))
              )}
            </Section>
          </>
        )}
      </div>

      <UserMenu />
    </motion.div>
  )
}

function Section({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      {label && <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">{label}</p>}
      {children}
    </div>
  )
}

function ConvItem({ conv, active, onClick, onDelete, onPin }: {
  conv: { id: string; title: string; pinned: boolean; updatedAt: string }
  active: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
  onPin: (e: React.MouseEvent) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors",
        active ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
      )}
      onClick={onClick}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium">{truncate(conv.title, 28)}</p>
        <p className="text-[10px] text-neutral-600">{formatRelative(conv.updatedAt)}</p>
      </div>
      <div className="hidden group-hover:flex items-center gap-0.5">
        <button onClick={onPin} className="p-1 rounded hover:bg-neutral-700 transition-colors">
          <Pin className={cn("h-3 w-3", conv.pinned ? "text-blue-400" : "text-neutral-500")} />
        </button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-red-500/20 transition-colors">
          <Trash2 className="h-3 w-3 text-neutral-500 hover:text-red-400" />
        </button>
      </div>
    </motion.div>
  )
}
