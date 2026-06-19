"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { useChatStore } from "@/stores/chat.store"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { chatService } from "@/services/mock"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login")
  }, [isAuthenticated, router])

  const { addConversation } = useChatStore()

  useKeyboardShortcuts([
    { key: "k", ctrl: true, action: async () => { const c = await chatService.createConversation(); addConversation(c) } },
  ])

  if (!isAuthenticated) return null

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
