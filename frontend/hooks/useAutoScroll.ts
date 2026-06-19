import { useEffect, useRef } from "react"
import { useChatStore } from "@/stores/chat.store"

export function useAutoScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const isStreaming = useChatStore(s => s.isStreaming)
  const conversations = useChatStore(s => s.conversations)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }, [isStreaming, conversations])

  return ref
}
