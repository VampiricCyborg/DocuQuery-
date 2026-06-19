import { create } from "zustand"
import type { Conversation, Message } from "@/types"
import { generateId } from "@/lib/utils"
import { chatService } from "@/services/mock"

interface ChatStore {
  conversations: Conversation[]
  activeId: string | null
  isStreaming: boolean
  sidebarOpen: boolean
  setConversations: (c: Conversation[]) => void
  setActiveId: (id: string | null) => void
  addConversation: (c: Conversation) => void
  deleteConversation: (id: string) => void
  togglePin: (id: string) => void
  updateTitle: (id: string, title: string) => void
  sendMessage: (content: string, attachments?: Message["attachments"]) => Promise<void>
  retryLast: () => Promise<void>
  toggleSidebar: () => void
  activeConversation: () => Conversation | undefined
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  conversations: [],
  activeId: null,
  isStreaming: false,
  sidebarOpen: true,

  setConversations: (conversations) => set({ conversations }),
  setActiveId: (activeId) => set({ activeId }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

  activeConversation: () => {
    const { conversations, activeId } = get()
    return conversations.find(c => c.id === activeId)
  },

  addConversation: (c) =>
    set(s => ({ conversations: [c, ...s.conversations], activeId: c.id })),

  deleteConversation: (id) =>
    set(s => ({
      conversations: s.conversations.filter(c => c.id !== id),
      activeId: s.activeId === id ? null : s.activeId,
    })),

  togglePin: (id) =>
    set(s => ({
      conversations: s.conversations.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c),
    })),

  updateTitle: (id, title) =>
    set(s => ({
      conversations: s.conversations.map(c => c.id === id ? { ...c, title } : c),
    })),

  sendMessage: async (content, attachments) => {
    const { activeId, conversations } = get()
    if (!activeId) return

    const userMsg: Message = {
      id: generateId(), role: "user", content, status: "done",
      timestamp: new Date().toISOString(), attachments,
    }
    const aiMsg: Message = {
      id: generateId(), role: "assistant", content: "",
      status: "streaming", timestamp: new Date().toISOString(),
    }

    const addMsg = (msg: Message) =>
      set(s => ({
        conversations: s.conversations.map(c =>
          c.id === activeId ? { ...c, messages: [...c.messages, msg], updatedAt: new Date().toISOString() } : c
        ),
      }))

    const updateAiContent = (chunk: string) =>
      set(s => ({
        conversations: s.conversations.map(c =>
          c.id === activeId ? {
            ...c,
            messages: c.messages.map(m =>
              m.id === aiMsg.id ? { ...m, content: m.content + chunk } : m
            ),
          } : c
        ),
      }))

    addMsg(userMsg)
    addMsg(aiMsg)
    set({ isStreaming: true })

    // Auto-title from first message
    const conv = conversations.find(c => c.id === activeId)
    if (conv && conv.messages.length === 0) {
      get().updateTitle(activeId, content.slice(0, 40) || "New Chat")
    }

    try {
      for await (const chunk of chatService.streamMessage(content)) {
        updateAiContent(chunk)
      }
      set(s => ({
        conversations: s.conversations.map(c =>
          c.id === activeId ? {
            ...c,
            messages: c.messages.map(m =>
              m.id === aiMsg.id ? { ...m, status: "done" } : m
            ),
          } : c
        ),
      }))
    } catch {
      set(s => ({
        conversations: s.conversations.map(c =>
          c.id === activeId ? {
            ...c,
            messages: c.messages.map(m =>
              m.id === aiMsg.id ? { ...m, status: "error" } : m
            ),
          } : c
        ),
      }))
    } finally {
      set({ isStreaming: false })
    }
  },

  retryLast: async () => {
    const { activeId } = get()
    if (!activeId) return
    const conv = get().activeConversation()
    if (!conv) return
    const lastUser = [...conv.messages].reverse().find(m => m.role === "user")
    if (!lastUser) return
    // Remove last AI message and resend
    set(s => ({
      conversations: s.conversations.map(c =>
        c.id === activeId ? { ...c, messages: c.messages.slice(0, -1) } : c
      ),
    }))
    await get().sendMessage(lastUser.content)
  },
}))
