"use client"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useChatStore } from "@/stores/chat.store"
import { chatService } from "@/services/mock"
import { MessageBubble } from "./MessageBubble"
import { ChatInput } from "./ChatInput"
import { MessageSkeleton } from "@/components/ui/Skeleton"
import { useAutoScroll } from "@/hooks/useAutoScroll"

const SUGGESTIONS = [
  "Summarize my uploaded documents",
  "What is RAG and how does it work?",
  "Compare different vector databases",
  "Help me set up a document pipeline",
]

export function ChatWindow() {
  const { conversations, activeId, setConversations, addConversation, sendMessage } = useChatStore()
  const bottomRef = useAutoScroll()
  const active = conversations.find(c => c.id === activeId)

  useEffect(() => {
    chatService.getConversations().then(setConversations)
  }, [setConversations])

  const handleSuggestion = async (text: string) => {
    if (activeId) {
      await sendMessage(text)
    } else {
      const conv = await chatService.createConversation()
      addConversation(conv)
      // sendMessage will be called after activeId is set via store
      setTimeout(() => sendMessage(text), 50)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!active ? (
          <WelcomeScreen onSuggestion={handleSuggestion} />
        ) : active.messages.length === 0 ? (
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
  return (
    <div className="flex flex-1 flex-col items-center justify-center h-full px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6 max-w-lg w-full"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">How can I help you?</h1>
          <p className="mt-1.5 text-sm text-neutral-500">Ask anything, upload documents, or pick an agent below.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          {SUGGESTIONS.map(s => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestion(s)}
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-left text-sm text-neutral-300 hover:border-neutral-600 hover:text-white transition-all"
            >
              {s}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
