"use client"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Copy, Check, RefreshCw, AlertCircle } from "lucide-react"
import type { Message } from "@/types"
import { Avatar } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { useCopy } from "@/hooks/useCopy"
import { useChatStore } from "@/stores/chat.store"
import { useAuthStore } from "@/stores/auth.store"
import { formatTime, cn } from "@/lib/utils"
import { ToolCallDisplay } from "./ToolCallDisplay"

export function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const { copy, copied } = useCopy()
  const retryLast = useChatStore(s => s.retryLast)
  const user = useAuthStore(s => s.user)
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("group flex gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors", isUser && "flex-row-reverse")}
    >
      <Avatar
        name={isUser ? user?.name : "AI"}
        src={isUser ? user?.avatar : undefined}
        size="sm"
      />

      <div className={cn("flex max-w-[75%] flex-col gap-1", isUser && "items-end")}>
        {/* Tool calls */}
        {message.toolCalls?.map(tc => <ToolCallDisplay key={tc.id} toolCall={tc} />)}

        {/* Content */}
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-neutral-800/60 text-neutral-100 rounded-tl-sm"
        )}>
          {message.status === "streaming" && !message.content ? (
            <TypingIndicator />
          ) : (
            <div className="prose prose-invert prose-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          {message.status === "streaming" && message.content && (
            <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-current" />
          )}
        </div>

        {/* Error */}
        {message.status === "error" && (
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Failed to generate response
          </div>
        )}

        {/* Actions */}
        <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", isUser && "flex-row-reverse")}>
          <span className="text-[10px] text-neutral-600">{formatTime(message.timestamp)}</span>
          {!isUser && message.status === "done" && (
            <>
              <Tooltip content={copied ? "Copied!" : "Copy"}>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(message.content)}>
                  {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                </Button>
              </Tooltip>
              {isLast && (
                <Tooltip content="Retry">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={retryLast}>
                    <RefreshCw className="h-3 w-3" />
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
    <div className="flex items-center gap-1 py-1">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-neutral-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay }}
        />
      ))}
    </div>
  )
}
