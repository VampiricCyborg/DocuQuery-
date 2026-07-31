"use client"
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, Mic, MicOff, X, StopCircle } from "lucide-react"
import { useChatStore } from "@/stores/chat.store"
import { useFileStore } from "@/stores/file.store"
import { useVoice } from "@/hooks/useVoice"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { ModeIndicator } from "./ModeIndicator"
import { cn, formatBytes, generateId } from "@/lib/utils"
import { CHAT_MODE_META } from "@/types"
import type { Conversation } from "@/types"

const MODE_PLACEHOLDERS = {
  docuquery: "Ask about your uploaded documents…",
  llm: "Chat with AI freely…",
  hybrid: "Ask anything — documents first, then AI knowledge…",
}

export function ChatInput() {
  const [text, setText] = useState("")
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { sendMessage, isStreaming, activeId, addConversation, activeMode } = useChatStore()
  const { addFile } = useFileStore()

  const { voiceState, start: startVoice, stop: stopVoice } = useVoice((transcript) => {
    setText(t => t + (t ? " " : "") + transcript)
    textareaRef.current?.focus()
  })

  const handleSubmit = useCallback(async () => {
    const content = text.trim()
    if (!content || isStreaming) return

    if (!activeId) {
      const conv: Conversation = {
        id: generateId(),
        title: "New Chat",
        messages: [],
        mode: activeMode,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addConversation(conv)
    }

    setText("")
    setPendingFiles([])
    for (const f of pendingFiles) addFile(f)

    // Small delay to allow the store to register the new conversation
    await new Promise(r => setTimeout(r, 0))
    await sendMessage(content)
    textareaRef.current?.style.setProperty("height", "auto")
  }, [text, isStreaming, activeId, pendingFiles, activeMode, addFile, addConversation, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
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
    <div className="border-t border-neutral-800 bg-neutral-950 px-4 pb-4 pt-3">
      {/* Mode indicator row */}
      <div className="mb-2 flex items-center gap-2">
        <ModeIndicator />
        <span className="text-[11px] text-neutral-600">
          {CHAT_MODE_META[activeMode].description}
        </span>
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
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-300"
              >
                <span className="truncate max-w-[120px]">{f.name}</span>
                <span className="text-neutral-500">{formatBytes(f.size)}</span>
                <button
                  onClick={() => removePending(i)}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input box */}
      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border bg-neutral-900 px-3 py-2 transition-colors",
          "border-neutral-700 focus-within:border-neutral-500"
        )}
      >
        {/* Attach */}
        <Tooltip content="Attach file">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 mb-0.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </Tooltip>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={MODE_PLACEHOLDERS[activeMode]}
          rows={1}
          disabled={isStreaming}
          className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none disabled:opacity-40 py-1 max-h-[200px]"
        />

        {/* Voice */}
        <Tooltip content={voiceState === "listening" ? "Stop listening" : "Voice input"}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0 mb-0.5",
              voiceState === "listening" && "text-red-400 bg-red-500/10"
            )}
            onClick={voiceState === "listening" ? stopVoice : startVoice}
          >
            {voiceState === "listening"
              ? <MicOff className="h-4 w-4" />
              : <Mic className="h-4 w-4" />}
          </Button>
        </Tooltip>

        {/* Send */}
        <Tooltip content={isStreaming ? "Streaming…" : "Send (Enter)"}>
          <Button
            size="icon"
            className="h-8 w-8 shrink-0 mb-0.5"
            disabled={(!text.trim() && !isStreaming) || isStreaming}
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
