"use client"
import { StatsGrid } from "@/components/dashboard/StatsGrid"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { MOCK_CONVERSATIONS } from "@/services/mock"
import { formatRelative, truncate } from "@/lib/utils"
import { MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Overview of your usage and activity</p>
        </div>

        <StatsGrid />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Recent Chats</h2>
              <Link href="/chat" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {MOCK_CONVERSATIONS.slice(0, 4).map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/chat/${c.id}`} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-neutral-800 transition-colors">
                    <MessageSquare className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span className="flex-1 text-sm text-neutral-300 truncate">{truncate(c.title, 36)}</span>
                    <span className="text-xs text-neutral-600">{formatRelative(c.updatedAt)}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
