"use client"
import { motion } from "framer-motion"
import { MessageSquare, Upload, Zap } from "lucide-react"
import { MOCK_ACTIVITY } from "@/services/mock"
import { formatRelative } from "@/lib/utils"

const icons = { chat: MessageSquare, upload: Upload, agent: Zap }
const colors = { chat: "text-blue-400 bg-blue-500/10", upload: "text-purple-400 bg-purple-500/10", agent: "text-orange-400 bg-orange-500/10" }

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {MOCK_ACTIVITY.map((item, i) => {
          const Icon = icons[item.type]
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors[item.type]}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-300 truncate">{item.description}</p>
              </div>
              <span className="text-xs text-neutral-600 shrink-0">{formatRelative(item.timestamp)}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
