"use client"
import { useQuery } from "@tanstack/react-query"
import { agentService } from "@/services/mock"
import { AgentCard } from "@/components/agents/AgentCard"
import { useUIStore } from "@/stores/ui.store"
import { Skeleton } from "@/components/ui/Skeleton"

export default function AgentsPage() {
  const { data: agents = [], isLoading } = useQuery({ queryKey: ["agents"], queryFn: agentService.getAgents })
  const { selectedAgent, setSelectedAgent } = useUIStore()

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
                onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
