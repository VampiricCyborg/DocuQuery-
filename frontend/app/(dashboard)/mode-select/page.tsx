"use client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useChatStore } from "@/stores/chat.store"
import { CHAT_MODE_META, type ChatMode } from "@/types"
import { generateId } from "@/lib/utils"
import type { Conversation } from "@/types"

const MODES: { mode: ChatMode; gradient: string; border: string; glow: string }[] = [
  {
    mode: "docuquery",
    gradient: "from-emerald-600/20 to-emerald-900/10",
    border: "border-emerald-700/40 hover:border-emerald-500/60",
    glow: "shadow-emerald-900/20",
  },
  {
    mode: "llm",
    gradient: "from-blue-600/20 to-blue-900/10",
    border: "border-blue-700/40 hover:border-blue-500/60",
    glow: "shadow-blue-900/20",
  },
  {
    mode: "hybrid",
    gradient: "from-purple-600/20 to-purple-900/10",
    border: "border-purple-700/40 hover:border-purple-500/60",
    glow: "shadow-purple-900/20",
  },
]

const MODE_FEATURES: Record<ChatMode, string[]> = {
  docuquery: [
    "Answers grounded only in your documents",
    "Never hallucinates — no outside knowledge",
    "Cites exact sources with page numbers",
    "Best for specific document questions",
  ],
  llm: [
    "Full AI general knowledge available",
    "No document retrieval overhead",
    "Great for explanations and brainstorming",
    "Like ChatGPT — open-ended conversation",
  ],
  hybrid: [
    "Searches documents first",
    "Falls back to AI knowledge when needed",
    "Clearly separates document vs AI content",
    "Best of both worlds",
  ],
}

export default function ModeSelectPage() {
  const router = useRouter()
  const { setMode, addConversation, activeMode } = useChatStore()

  const handleSelect = (mode: ChatMode) => {
    setMode(mode)
    const conv: Conversation = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      mode,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addConversation(conv)
    router.push("/chat")
  }

  const handleContinue = () => {
    router.push("/chat")
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl shadow-blue-500/30 text-3xl"
          >
            🧠
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome to DocuQuery
          </h1>
          <p className="mt-2 text-neutral-400">
            How would you like to use AI today?
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {MODES.map(({ mode, gradient, border, glow }, i) => {
            const meta = CHAT_MODE_META[mode]
            const features = MODE_FEATURES[mode]
            const isActive = activeMode === mode

            return (
              <motion.button
                key={mode}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(mode)}
                className={`relative flex flex-col items-start gap-4 rounded-2xl border bg-gradient-to-br ${gradient} ${border} p-6 text-left transition-all duration-200 shadow-xl ${glow} ${
                  isActive ? "ring-2 ring-offset-1 ring-offset-neutral-950 ring-blue-500/50" : ""
                }`}
              >
                {/* Icon + label */}
                <div className="flex items-center gap-3 w-full">
                  <span className="text-3xl">{meta.icon}</span>
                  <div>
                    <h3 className={`text-base font-semibold ${meta.color}`}>
                      {meta.label}
                    </h3>
                    {isActive && (
                      <span className="text-[10px] text-neutral-500 font-medium">
                        Current mode
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {meta.description}
                </p>

                {/* Features */}
                <ul className="space-y-1.5 w-full">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-neutral-500">
                      <span className="mt-0.5 text-neutral-600">•</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className={`mt-auto w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${meta.color} bg-white/5 hover:bg-white/10`}>
                  Use {meta.label}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Skip link */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors underline underline-offset-4"
          >
            Continue with current mode ({CHAT_MODE_META[activeMode].label})
          </button>
        </div>
      </motion.div>
    </div>
  )
}
