"use client"
import { motion } from "framer-motion"
import { MessageSquare, Files, Zap, TrendingUp } from "lucide-react"
import type { UsageStats } from "@/types"
import { MOCK_STATS } from "@/services/mock"

function StatCard({ icon: Icon, label, used, limit, color }: {
  icon: React.ElementType; label: string; used: number; limit: number; color: string
}) {
  const pct = Math.round((used / limit) * 100)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-neutral-800 bg-neutral-900 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-xs text-neutral-500">{pct}%</span>
      </div>
      <p className="text-2xl font-bold text-white">{used.toLocaleString()}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label} · limit {limit.toLocaleString()}</p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  )
}

export function StatsGrid() {
  const s = MOCK_STATS
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard icon={MessageSquare} label="Messages" used={s.messagesUsed} limit={s.messagesLimit} color="bg-blue-600" />
      <StatCard icon={Files} label="Files" used={s.filesUploaded} limit={s.filesLimit} color="bg-purple-600" />
      <StatCard icon={Zap} label="Tokens" used={s.tokensUsed} limit={s.tokensLimit} color="bg-orange-600" />
      <StatCard icon={TrendingUp} label="Sessions" used={42} limit={100} color="bg-green-600" />
    </div>
  )
}
