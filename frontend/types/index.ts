// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: "free" | "pro" | "enterprise"
  createdAt: string
}

// ─── Chat ────────────────────────────────────────────────────────────────────
export type MessageRole = "user" | "assistant" | "system"
export type MessageStatus = "sending" | "streaming" | "done" | "error"

export interface Message {
  id: string
  role: MessageRole
  content: string
  status: MessageStatus
  timestamp: string
  attachments?: FileAttachment[]
  toolCalls?: ToolCall[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  agentId?: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

// ─── Files ───────────────────────────────────────────────────────────────────
export type FileStatus = "uploading" | "processing" | "ready" | "error"
export type FileType = "pdf" | "docx" | "txt" | "image" | "other"

export interface FileAttachment {
  id: string
  name: string
  size: number
  type: FileType
  url?: string
  status: FileStatus
  progress?: number
}

// ─── Agents ──────────────────────────────────────────────────────────────────
export type AgentStatus = "idle" | "running" | "error"

export interface Agent {
  id: string
  name: string
  description: string
  icon: string
  status: AgentStatus
  tools: string[]
  color: string
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output?: string
  status: "pending" | "running" | "done" | "error"
}

// ─── Voice ───────────────────────────────────────────────────────────────────
export type VoiceState = "idle" | "listening" | "processing" | "speaking"

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface UsageStats {
  messagesUsed: number
  messagesLimit: number
  filesUploaded: number
  filesLimit: number
  tokensUsed: number
  tokensLimit: number
}

export interface ActivityItem {
  id: string
  type: "chat" | "upload" | "agent"
  description: string
  timestamp: string
}
