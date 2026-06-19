"use client"
import { motion } from "framer-motion"
import { Wrench } from "lucide-react"
import type { Agent } from "@/types"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

const colorMap: Record<string, string> = {
  blue: "from-blue-600/20 to-blue-600/5 border-blue-500/20",
  green: "from-green-600/20 to-green-600/5 border-green-500/20",
  purple: "from-purple-600/20 to-purple-600/5 border-purple-500/20",
  orange: "from-orange-600/20 to-orange-600/5 border-orange-500/20",
}

const statusVariant: Record<Agent["status"], "success" | "warning" | "error"> = {
  idle: "success", running: "warning", error: "error",
}

export function AgentCard({ agent, selected, onClick }: {
  agent: Agent
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border bg-gradient-to-br p-4 transition-all",
        colorMap[agent.color] ?? colorMap.blue,
        selected && "ring-2 ring-blue-500"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{agent.icon}</span>
        <Badge variant={statusVariant[agent.status]}>{agent.status}</Badge>
      </div>
      <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
      <p className="mt-1 text-xs text-neutral-400">{agent.description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {agent.tools.map(t => (
          <span key={t} className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-neutral-400">
            <Wrench className="h-2.5 w-2.5" />{t}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
