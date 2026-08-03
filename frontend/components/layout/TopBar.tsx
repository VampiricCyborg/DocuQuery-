"use client"
import { PanelLeft, Bell } from "lucide-react"
import { useChatStore } from "@/stores/chat.store"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { UserMenu } from "@/components/sidebar/UserMenu"

export function TopBar() {
  const { toggleSidebar, sidebarOpen, activeConversation } = useChatStore()
  const active = activeConversation()

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <Tooltip content="Open sidebar">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <PanelLeft className="h-4 w-4" />
            </Button>
          </Tooltip>
        )}
        {active && (
          <h1 className="text-sm font-medium text-neutral-300 truncate max-w-xs">{active.title}</h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Tooltip content="Notifications">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </Tooltip>
        <UserMenu compact />
      </div>
    </header>
  )
}
