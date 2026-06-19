import type { Agent, Conversation, UsageStats, ActivityItem, User } from "@/types"
import { generateId } from "@/lib/utils"

export const MOCK_USER: User = {
  id: "u1",
  name: "Madhav",
  email: "madhav@example.com",
  avatar: undefined,
  plan: "pro",
  createdAt: new Date().toISOString(),
}

export const MOCK_AGENTS: Agent[] = [
  { id: "a1", name: "DocuQuery", description: "RAG over your documents", icon: "📄", status: "idle", tools: ["search", "summarize"], color: "blue" },
  { id: "a2", name: "Web Search", description: "Real-time web search", icon: "🌐", status: "idle", tools: ["search", "browse"], color: "green" },
  { id: "a3", name: "Code Assistant", description: "Write and review code", icon: "💻", status: "idle", tools: ["code", "execute"], color: "purple" },
  { id: "a4", name: "Data Analyst", description: "Analyze data & charts", icon: "📊", status: "idle", tools: ["analyze", "chart"], color: "orange" },
]

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1", title: "RAG pipeline setup", pinned: true,
    agentId: "a1",
    messages: [
      { id: "m1", role: "user", content: "How do I set up a RAG pipeline?", status: "done", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: "m2", role: "assistant", content: "A RAG pipeline has three main components:\n\n1. **Ingestion** — chunk and embed your documents\n2. **Retrieval** — vector similarity search\n3. **Generation** — LLM with retrieved context\n\nWant me to walk through each step?", status: "done", timestamp: new Date(Date.now() - 3500000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: "c2", title: "Vector database comparison", pinned: false,
    messages: [
      { id: "m3", role: "user", content: "Compare Pinecone vs Weaviate vs Chroma", status: "done", timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "c3", title: "LangChain vs LlamaIndex", pinned: false,
    messages: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

export const MOCK_STATS: UsageStats = {
  messagesUsed: 847, messagesLimit: 1000,
  filesUploaded: 23, filesLimit: 50,
  tokensUsed: 125000, tokensLimit: 200000,
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "act1", type: "chat", description: "Started chat: RAG pipeline setup", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "act2", type: "upload", description: "Uploaded research_paper.pdf", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "act3", type: "agent", description: "DocuQuery agent processed 3 docs", timestamp: new Date(Date.now() - 10800000).toISOString() },
  { id: "act4", type: "chat", description: "Started chat: Vector database comparison", timestamp: new Date(Date.now() - 86400000).toISOString() },
]

// ─── Mock API ─────────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    await delay(300)
    return MOCK_CONVERSATIONS
  },
  async getConversation(id: string): Promise<Conversation | undefined> {
    await delay(200)
    return MOCK_CONVERSATIONS.find(c => c.id === id)
  },
  async createConversation(): Promise<Conversation> {
    await delay(200)
    return { id: generateId(), title: "New Chat", messages: [], pinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  },
  async deleteConversation(id: string): Promise<void> {
    await delay(200)
  },
  // Simulates streaming — yields chunks
  async *streamMessage(content: string): AsyncGenerator<string> {
    const response = `I understand you're asking about **"${content.slice(0, 40)}..."**\n\nThis is a simulated streaming response from the AI assistant. In production, this will connect to your RAG backend and stream real responses token by token.\n\n**Key capabilities:**\n- Document retrieval from your private fleet\n- Multi-agent orchestration\n- Real-time streaming responses\n\nHow can I help you further?`
    const words = response.split(" ")
    for (const word of words) {
      await delay(40)
      yield word + " "
    }
  },
}

export const fileService = {
  async uploadFile(file: File, onProgress: (p: number) => void): Promise<string> {
    for (let i = 0; i <= 100; i += 10) {
      await delay(150)
      onProgress(i)
    }
    return generateId()
  },
}

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    await delay(200)
    return MOCK_AGENTS
  },
}
