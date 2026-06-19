"use client"
import { useEffect } from "react"
import { useChatStore } from "@/stores/chat.store"
import { ChatWindow } from "@/components/chat/ChatWindow"

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const { setActiveId } = useChatStore()

  useEffect(() => {
    setActiveId(params.id)
  }, [params.id, setActiveId])

  return <ChatWindow />
}
