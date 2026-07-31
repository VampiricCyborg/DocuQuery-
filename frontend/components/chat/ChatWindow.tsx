"use client"
import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useChatStore } from "@/stores/chat.store"
import { MessageBubble } from "./MessageBubble"
import { ChatInput } from "./ChatInput"
import { useAutoScroll } from "@/hooks/useAutoScroll"
import { CHAT_MODE_META } from "@/types"
import { generateId } from "@/lib/utils"
import type { Conversation } from "@/types"

const SUGGESTIONS_BY_MODE = {
  docuquery: [
    "Ask a question about my uploaded documents",
    "Summarize my assignment document",
    "Compare the key points in my documents",
    "List action items from the uploaded files",
  ],
  llm: [
    "Explain a difficult concept to me",
    "Help me write or improve something",
    "Brainstorm ideas for my next project",
    "Have a normal conversation with me",
  ],
  hybrid: [
    "Answer the questions in my assignment",
    "Explain my document with outside context",
    "Summarize this and suggest next steps",
    "Compare my documents with current best practices",
  ],
}

export function ChatWindow() {
  const { conversations, activeId, addConversation, sendMessage, activeMode } = useChatStore()
  const bottomRef = useAutoScroll()
  const active = conversations.find(c => c.id === activeId)

  const handleSuggestion = async (text: string) => {
    if (!activeId) {
      const conv: Conversation = {
        id: generateId(),
        title: text.slice(0, 52).trim(),
        messages: [],
        mode: activeMode,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addConversation(conv)
      // Let the store flush before sending
      await new Promise(r => setTimeout(r, 0))
    }
    await sendMessage(text)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {!active || active.messages.length === 0 ? (
          <WelcomeScreen onSuggestion={handleSuggestion} />
        ) : (
          <div className="mx-auto max-w-3xl py-4">
            {active.messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={i === active.messages.length - 1}
              />
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mx-auto w-full max-w-3xl">
        <ChatInput />
      </div>
    </div>
  )
}

function WelcomeScreen({ onSuggestion }: { onSuggestion: (t: string) => void }) {
  const { activeMode } = useChatStore()
  const meta = CHAT_MODE_META[activeMode]
  const suggestions = SUGGESTIONS_BY_MODE[activeMode]

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center gap-6 max-w-lg w-full"
      >
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
          <Sparkles className="h-7 w-7 text-white" />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">
            {meta.icon} {meta.label} Mode
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">{meta.description}</p>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-neutral-600">
            {activeMode === "docuquery" && "Ask about files you have uploaded. Every answer is grounded in those documents."}
            {activeMode === "llm" && "Ask anything and have a general AI conversation without document retrieval."}
            {activeMode === "hybrid" && "Use your documents as context, then let AI reason through answers and next steps."}
          </p>
        </div>

        {/* Suggestion chips */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {suggestions.map(s => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSuggestion(s)}
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-left text-xs text-neutral-300 hover:border-neutral-600 hover:text-white transition-all"
            >
              {s}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
