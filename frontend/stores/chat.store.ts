import { create } from "zustand"
import type { Conversation, Message, ChatMode, Citation } from "@/types"
import { generateId } from "@/lib/utils"
import { chatApi } from "@/services/api"

interface ChatStore {
  conversations: Conversation[]
  activeId: string | null
  activeMode: ChatMode
  isStreaming: boolean
  sidebarOpen: boolean

  // Conversations
  setConversations: (c: Conversation[]) => void
  setActiveId: (id: string | null) => void
  addConversation: (c: Conversation) => void
  deleteConversation: (id: string) => void
  togglePin: (id: string) => void
  updateTitle: (id: string, title: string) => void

  // Mode
  setMode: (mode: ChatMode) => void

  // Messaging
  sendMessage: (content: string, attachments?: Message["attachments"]) => Promise<void>
  retryLast: () => Promise<void>
  setFeedback: (conversationId: string, messageId: string, feedback: "up" | "down" | null) => void

  // UI
  toggleSidebar: () => void
  activeConversation: () => Conversation | undefined
}

export const useChatStore = create<ChatStore>()((set, get) => ({
      conversations: [],
      activeId: null,
      activeMode: "docuquery",
      isStreaming: false,
      sidebarOpen: true,

      setConversations: (conversations) => set({ conversations }),
      setActiveId: (activeId) => set({ activeId }),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setMode: (activeMode) => set({ activeMode }),

      activeConversation: () => {
        const { conversations, activeId } = get()
        return conversations.find(c => c.id === activeId)
      },

      addConversation: (c) =>
        set(s => ({ conversations: [c, ...s.conversations], activeId: c.id })),

      deleteConversation: (id) =>
        set(s => ({
          conversations: s.conversations.filter(c => c.id !== id),
          activeId: s.activeId === id ? (s.conversations.find(c => c.id !== id)?.id ?? null) : s.activeId,
        })),

      togglePin: (id) =>
        set(s => ({
          conversations: s.conversations.map(c =>
            c.id === id ? { ...c, pinned: !c.pinned } : c
          ),
        })),

      updateTitle: (id, title) =>
        set(s => ({
          conversations: s.conversations.map(c =>
            c.id === id ? { ...c, title } : c
          ),
        })),

      setFeedback: (conversationId, messageId, feedback) =>
        set(s => ({
          conversations: s.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, feedback } : m
                  ),
                }
              : c
          ),
        })),

      sendMessage: async (content, attachments) => {
        const { activeId, conversations, activeMode } = get()
        if (!activeId) return

        const userMsg: Message = {
          id: generateId(),
          role: "user",
          content,
          status: "done",
          timestamp: new Date().toISOString(),
          attachments,
        }
        const aiMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: "",
          status: "streaming",
          timestamp: new Date().toISOString(),
          citations: [],
        }

        const patchConv = (updater: (c: Conversation) => Conversation) =>
          set(s => ({
            conversations: s.conversations.map(c =>
              c.id === activeId ? updater(c) : c
            ),
          }))

        const addMsg = (msg: Message) =>
          patchConv(c => ({
            ...c,
            messages: [...c.messages, msg],
            updatedAt: new Date().toISOString(),
          }))

        const appendToken = (token: string) =>
          patchConv(c => ({
            ...c,
            messages: c.messages.map(m =>
              m.id === aiMsg.id ? { ...m, content: m.content + token } : m
            ),
          }))

        const setCitations = (citations: Citation[]) =>
          patchConv(c => ({
            ...c,
            messages: c.messages.map(m =>
              m.id === aiMsg.id ? { ...m, citations } : m
            ),
          }))

        const setAiStatus = (status: Message["status"]) =>
          patchConv(c => ({
            ...c,
            messages: c.messages.map(m =>
              m.id === aiMsg.id ? { ...m, status } : m
            ),
          }))

        // Auto-title the conversation from its first user message
        const conv = conversations.find(c => c.id === activeId)
        if (conv && conv.messages.length === 0) {
          get().updateTitle(activeId, content.slice(0, 52).trim() || "New Chat")
        }

        addMsg(userMsg)
        addMsg(aiMsg)
        set({ isStreaming: true })

        try {
          for await (const event of chatApi.stream(content)) {
            if (event.type === "token") {
              appendToken(event.data)
            } else if (event.type === "citations") {
              // Map CitationOut → Citation (same shape, just normalizing)
              setCitations(
                event.data.map(c => ({
                  document_id: c.document_id,
                  filename: c.filename,
                  page: c.page,
                  chunk_index: c.chunk_index,
                }))
              )
            }
            // error events are swallowed here; the status turns to "error" in catch
          }
          setAiStatus("done")
        } catch {
          setAiStatus("error")
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
        // Remove the last AI message then resend
        set(s => ({
          conversations: s.conversations.map(c =>
            c.id === activeId
              ? { ...c, messages: c.messages.slice(0, -1) }
              : c
          ),
        }))
        await get().sendMessage(lastUser.content)
      },
  }))
      // Only persist conversations and UI prefs — don't persist streaming state
//))
