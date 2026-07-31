"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"
import { useChatStore } from "@/stores/chat.store"
import { CHAT_MODE_META, type ChatMode } from "@/types"
import { cn } from "@/lib/utils"

const MODES: ChatMode[] = ["docuquery", "llm", "hybrid"]

export function ModeIndicator() {
  const { activeMode, setMode } = useChatStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const meta = CHAT_MODE_META[activeMode]

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
          "text-xs font-medium transition-all duration-150",
          "border border-neutral-700/60 bg-neutral-800/60",
          "hover:border-neutral-600 hover:bg-neutral-800",
          open && "border-neutral-600 bg-neutral-800"
        )}
      >
        <span>{meta.icon}</span>
        <span className={meta.color}>{meta.label}</span>
        <ChevronDown className={cn("h-3 w-3 text-neutral-500 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1.5 z-50 w-64 rounded-xl border border-neutral-700/60 bg-neutral-900 shadow-xl shadow-black/40 overflow-hidden"
          >
            <div className="p-1">
              {MODES.map(mode => {
                const m = CHAT_MODE_META[mode]
                const isActive = mode === activeMode
                return (
                  <button
                    key={mode}
                    onClick={() => { setMode(mode); setOpen(false) }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
                    )}
                  >
                    <span className="text-base mt-0.5">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-xs font-semibold", m.color)}>{m.label}</span>
                        {isActive && <Check className="h-3 w-3 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
