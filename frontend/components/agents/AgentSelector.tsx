"use client"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Zap } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useUIStore } from "@/stores/ui.store"
import { useQuery } from "@tanstack/react-query"
import { agentService } from "@/services/mock"
import { Badge } from "@/components/ui/Badge"
import type { Agent } from "@/types"

const statusVariant: Record<Agent["status"], "success" | "warning" | "error"> = {
  idle: "success", running: "warning", error: "error",
}

export function AgentSelector() {
  const { selectedAgent, setSelectedAgent } = useUIStore()
  const { data: agents = [] } = useQuery({ queryKey: ["agents"], queryFn: agentService.getAgents })

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors border border-transparent hover:border-neutral-700">
          <Zap className="h-3.5 w-3.5" />
          <span>{selectedAgent ? selectedAgent.name : "No agent"}</span>
          <ChevronDown className="h-3 w-3 ml-0.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start" sideOffset={6}
          className="z-50 w-64 rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-xl"
        >
          <DropdownMenu.Item
            onSelect={() => setSelectedAgent(null)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white cursor-pointer outline-none transition-colors"
          >
            No agent (direct chat)
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-neutral-800" />
          {agents.map(agent => (
            <DropdownMenu.Item
              key={agent.id}
              onSelect={() => setSelectedAgent(agent)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer outline-none hover:bg-neutral-800 transition-colors"
            >
              <span className="text-lg">{agent.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{agent.name}</p>
                <p className="text-xs text-neutral-500 truncate">{agent.description}</p>
              </div>
              <Badge variant={statusVariant[agent.status]}>{agent.status}</Badge>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
