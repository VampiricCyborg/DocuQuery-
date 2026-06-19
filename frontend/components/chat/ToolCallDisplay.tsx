"use client"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"
import type { ToolCall } from "@/types"
import { cn } from "@/lib/utils"

export function ToolCallDisplay({ toolCall }: { toolCall: ToolCall }) {
  const [open, setOpen] = useState(false)
  const icons = { pending: <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />, running: <Loader2 className="h-3 w-3 animate-spin text-blue-400" />, done: <CheckCircle className="h-3 w-3 text-green-400" />, error: <XCircle className="h-3 w-3 text-red-400" /> }

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900 text-xs overflow-hidden mb-1">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-2 px-3 py-2 hover:bg-neutral-800 transition-colors">
        {icons[toolCall.status]}
        <span className="text-neutral-300 font-mono">{toolCall.name}</span>
        <ChevronDown className={cn("ml-auto h-3 w-3 text-neutral-500 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <pre className="px-3 py-2 text-neutral-400 overflow-x-auto border-t border-neutral-800">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
            {toolCall.output && (
              <pre className="px-3 py-2 text-green-400 overflow-x-auto border-t border-neutral-800">
                {toolCall.output}
              </pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
