"use client"
import { useQuery } from "@tanstack/react-query"
import { agentService } from "@/services/mock"
import { AgentCard } from "@/components/agents/AgentCard"
import { useUIStore } from "@/stores/ui.store"
import { Skeleton } from "@/components/ui/Skeleton"
import { useChatStore } from "@/stores/chat.store"
import type { ChatMode } from "@/types"

export default function AgentsPage() {
  const { data: sourceAgents = [], isLoading } = useQuery({ queryKey: ["agents"], queryFn: agentService.getAgents })
  const agents = sourceAgents.slice(0, 3).map((agent, index) => ({
    ...agent,
    id: (["docuquery", "llm", "hybrid"] as const)[index],
    name: (["DocuQuery", "LLM", "Hybrid"] as const)[index],
    description: (["Ask questions grounded in your uploaded documents.", "General AI conversations and open-ended questions.", "Combine document context with AI reasoning."] as const)[index],
  }))
  const { selectedAgent, setSelectedAgent } = useUIStore()
  const setMode = useChatStore(s => s.setMode)

  const chooseAgent = (agent: typeof agents[number]) => {
    const selecting = selectedAgent?.id !== agent.id
    setSelectedAgent(selecting ? agent : null)
    if (selecting && ["docuquery", "llm", "hybrid"].includes(agent.id)) setMode(agent.id as ChatMode)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-white">AI Agents</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Select an agent to power your conversations</p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                selected={selectedAgent?.id === agent.id}
                onClick={() => chooseAgent(agent)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
