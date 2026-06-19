"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Volume2 } from "lucide-react"
import type { VoiceState } from "@/types"
import { cn } from "@/lib/utils"

export function VoiceWaveform({ state }: { state: VoiceState }) {
  const bars = Array.from({ length: 5 })

  return (
    <AnimatePresence>
      {state !== "idle" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-8"
        >
          {/* Icon */}
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            state === "listening" && "bg-red-500/20",
            state === "processing" && "bg-yellow-500/20",
            state === "speaking" && "bg-blue-500/20",
          )}>
            {state === "speaking"
              ? <Volume2 className="h-7 w-7 text-blue-400" />
              : state === "listening"
              ? <Mic className="h-7 w-7 text-red-400" />
              : <MicOff className="h-7 w-7 text-yellow-400" />}
          </div>

          {/* Waveform bars */}
          <div className="flex items-center gap-1.5 h-10">
            {bars.map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "w-1.5 rounded-full",
                  state === "listening" && "bg-red-400",
                  state === "processing" && "bg-yellow-400",
                  state === "speaking" && "bg-blue-400",
                )}
                animate={{ height: ["8px", `${16 + (i + 1) * 6}px`, "8px"] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <p className="text-sm text-neutral-400 capitalize">{state}…</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
