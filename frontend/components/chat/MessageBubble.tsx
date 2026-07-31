"use client"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Copy, Check, RefreshCw, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Message } from "@/types"
import { Avatar } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { useCopy } from "@/hooks/useCopy"
import { useChatStore } from "@/stores/chat.store"
import { useAuthStore } from "@/stores/auth.store"
import { formatTime, cn } from "@/lib/utils"
import { ToolCallDisplay } from "./ToolCallDisplay"
import { CitationList } from "./CitationCard"

export function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const { copy, copied } = useCopy()
  const retryLast = useChatStore(s => s.retryLast)
  const setFeedback = useChatStore(s => s.setFeedback)
  const activeId = useChatStore(s => s.activeId)
  const user = useAuthStore(s => s.user)
  const isUser = message.role === "user"
  const hasCitations = !isUser && (message.citations?.length ?? 0) > 0

  const handleFeedback = (fb: "up" | "down") => {
    if (!activeId) return
    const next = message.feedback === fb ? null : fb
    setFeedback(activeId, message.id, next)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex gap-3 px-4 py-3 hover:bg-white/[0.015] transition-colors",
        isUser && "flex-row-reverse"
      )}
    >
      <Avatar
        name={isUser ? user?.name : "AI"}
        src={isUser ? user?.avatar : undefined}
        size="sm"
      />

      <div className={cn("flex max-w-[78%] flex-col gap-1", isUser && "items-end")}>
        {/* Tool calls */}
        {message.toolCalls?.map(tc => (
          <ToolCallDisplay key={tc.id} toolCall={tc} />
        ))}

        {/* Content bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-blue-600 text-white rounded-tr-sm shadow-sm shadow-blue-900/30"
              : "bg-neutral-800/70 text-neutral-100 rounded-tl-sm border border-neutral-700/30"
          )}
        >
          {message.status === "streaming" && !message.content ? (
            <TypingIndicator />
          ) : (
            <div className={cn("prose prose-sm max-w-none", isUser ? "prose-invert" : "prose-invert")}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          {/* Streaming cursor */}
          {message.status === "streaming" && message.content && (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-neutral-300 rounded-full" />
          )}
        </div>

        {/* Citations — rendered outside the bubble */}
        {hasCitations && message.status === "done" && (
          <div className="w-full">
            <CitationList citations={message.citations!} />
          </div>
        )}

        {/* Error state */}
        {message.status === "error" && (
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Failed to generate a response
          </div>
        )}

        {/* Toolbar — timestamp + actions */}
        <div
          className={cn(
            "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser && "flex-row-reverse"
          )}
        >
          <span className="mr-1.5 text-[10px] text-neutral-600">
            {formatTime(message.timestamp)}
          </span>

          {!isUser && message.status === "done" && (
            <>
              {/* Copy */}
              <Tooltip content={copied ? "Copied!" : "Copy"}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md"
                  onClick={() => copy(message.content)}
                >
                  {copied
                    ? <Check className="h-3 w-3 text-green-400" />
                    : <Copy className="h-3 w-3 text-neutral-500 hover:text-white" />}
                </Button>
              </Tooltip>

              {/* Thumbs up */}
              <Tooltip content="Good response">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 rounded-md",
                    message.feedback === "up" && "text-emerald-400"
                  )}
                  onClick={() => handleFeedback("up")}
                >
                  <ThumbsUp className={cn("h-3 w-3", message.feedback === "up" ? "text-emerald-400" : "text-neutral-500 hover:text-white")} />
                </Button>
              </Tooltip>

              {/* Thumbs down */}
              <Tooltip content="Bad response">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 rounded-md",
                    message.feedback === "down" && "text-red-400"
                  )}
                  onClick={() => handleFeedback("down")}
                >
                  <ThumbsDown className={cn("h-3 w-3", message.feedback === "down" ? "text-red-400" : "text-neutral-500 hover:text-white")} />
                </Button>
              </Tooltip>

              {/* Retry (last message only) */}
              {isLast && (
                <Tooltip content="Regenerate">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md"
                    onClick={retryLast}
                  >
                    <RefreshCw className="h-3 w-3 text-neutral-500 hover:text-white" />
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      <span className="text-xs text-neutral-400 mr-1">Thinking</span>
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-neutral-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay }}
        />
      ))}
    </div>
  )
}
