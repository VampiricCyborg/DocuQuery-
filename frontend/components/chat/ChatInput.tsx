"use client"
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, Mic, MicOff, X, StopCircle } from "lucide-react"
import { useChatStore } from "@/stores/chat.store"
import { useFileStore } from "@/stores/file.store"
import { useVoice } from "@/hooks/useVoice"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { cn, formatBytes } from "@/lib/utils"
import { AgentSelector } from "@/components/agents/AgentSelector"

export function ChatInput() {
  const [text, setText] = useState("")
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { sendMessage, isStreaming, activeId } = useChatStore()
  const { addFile } = useFileStore()

  const { voiceState, start: startVoice, stop: stopVoice } = useVoice((transcript) => {
    setText(t => t + (t ? " " : "") + transcript)
    textareaRef.current?.focus()
  })

  const handleSubmit = useCallback(async () => {
    const content = text.trim()
    if (!content || isStreaming || !activeId) return
    setText("")
    setPendingFiles([])
    // Upload pending files
    for (const f of pendingFiles) addFile(f)
    await sendMessage(content)
    textareaRef.current?.style.setProperty("height", "auto")
  }, [text, isStreaming, activeId, pendingFiles, addFile, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    // Auto-resize
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setPendingFiles(p => [...p, ...files])
    e.target.value = ""
  }

  const removePending = (i: number) => setPendingFiles(p => p.filter((_, idx) => idx !== i))

  return (
    <div className="border-t border-neutral-800 bg-neutral-950 px-4 py-3">
      {/* Agent selector */}
      <div className="mb-2">
        <AgentSelector />
      </div>

      {/* Pending file chips */}
      <AnimatePresence>
        {pendingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex flex-wrap gap-2"
          >
            {pendingFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-300">
                <span className="truncate max-w-[120px]">{f.name}</span>
                <span className="text-neutral-500">{formatBytes(f.size)}</span>
                <button onClick={() => removePending(i)} className="text-neutral-500 hover:text-white transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input box */}
      <div className={cn(
        "flex items-end gap-2 rounded-xl border bg-neutral-900 px-3 py-2 transition-colors",
        "border-neutral-700 focus-within:border-neutral-500"
      )}>
        {/* File attach */}
        <Tooltip content="Attach file">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 mb-0.5"
            onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>
        </Tooltip>
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
          className="hidden" onChange={handleFileSelect} />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={activeId ? "Message DocuQuery… (Enter to send, Shift+Enter for newline)" : "Start a new chat first"}
          disabled={!activeId}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none disabled:opacity-40 py-1 max-h-[200px]"
        />

        {/* Voice */}
        <Tooltip content={voiceState === "listening" ? "Stop listening" : "Voice input"}>
          <Button
            variant="ghost" size="icon"
            className={cn("h-8 w-8 shrink-0 mb-0.5", voiceState === "listening" && "text-red-400 bg-red-500/10")}
            onClick={voiceState === "listening" ? stopVoice : startVoice}
          >
            {voiceState === "listening"
              ? <MicOff className="h-4 w-4" />
              : <Mic className="h-4 w-4" />}
          </Button>
        </Tooltip>

        {/* Send / Stop */}
        <Tooltip content={isStreaming ? "Stop" : "Send (Enter)"}>
          <Button
            size="icon"
            className="h-8 w-8 shrink-0 mb-0.5"
            disabled={!activeId || (!text.trim() && !isStreaming)}
            onClick={handleSubmit}
          >
            {isStreaming
              ? <StopCircle className="h-4 w-4" />
              : <Send className="h-4 w-4" />}
          </Button>
        </Tooltip>
      </div>

      <p className="mt-1.5 text-center text-[10px] text-neutral-700">
        DocuQuery can make mistakes. Verify important information.
      </p>
    </div>
  )
}
