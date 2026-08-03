"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { useChatStore } from "@/stores/chat.store"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { generateId } from "@/lib/utils"
import type { Conversation } from "@/types"
import { getDefaultChatMode } from "@/stores/settings.store"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.replace("/login")
  }, [isAuthenticated, isHydrated, router])

  const { addConversation } = useChatStore()

  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      action: () => {
        const conv: Conversation = {
          id: generateId(),
          title: "New Chat",
          messages: [],
          mode: getDefaultChatMode(),
          pinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        addConversation(conv)
        router.push("/chat")
      },
    },
  ])

  if (!isHydrated || !isAuthenticated) return null

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950 text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
