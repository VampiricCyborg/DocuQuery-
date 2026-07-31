"use client"
import { useEffect } from "react"
import { useChatStore } from "@/stores/chat.store"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { MOCK_CONVERSATIONS } from "@/services/mock"

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const { conversations, setConversations, setActiveId, setMode } = useChatStore()

  useEffect(() => {
    if (!conversations.some(conversation => conversation.id === params.id)) {
      const conversation = MOCK_CONVERSATIONS.find(item => item.id === params.id)
      if (conversation) {
        setConversations([...conversations, conversation])
        setMode(conversation.mode)
      }
    }
    setActiveId(params.id)
  }, [params.id, conversations, setActiveId, setConversations, setMode])

  return <ChatWindow />
}
