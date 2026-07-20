/**
 * Real API service — talks to the FastAPI backend.
 * Base URL is set via NEXT_PUBLIC_API_URL environment variable.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentOut {
  id: string
  original_filename: string
  file_type: string
  file_size: number
  status: "uploaded" | "processing" | "indexed" | "failed"
  created_at: string
  updated_at: string
  chunk_count: number
}

export interface CitationOut {
  document_id: string
  filename: string
  page: number
  chunk_index: number
}

export interface ChatResponseBody {
  answer: string
  citations: CitationOut[]
  model: string
  conversation_id?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`API ${res.status}: ${detail}`)
  }
  return res.json() as Promise<T>
}

// ─── Documents ────────────────────────────────────────────────────────────────

export const documentApi = {
  list: (): Promise<DocumentOut[]> =>
    request("/documents"),

  get: (id: string): Promise<DocumentOut> =>
    request(`/documents/${id}`),

  delete: (id: string): Promise<void> =>
    request(`/documents/${id}`, { method: "DELETE" }),

  upload: async (file: File, onProgress?: (p: number) => void): Promise<DocumentOut> => {
    const form = new FormData()
    form.append("file", file)

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${BASE_URL}/upload`)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status === 201) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error("Upload network error"))
      xhr.send(form)
    })
  },
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const chatApi = {
  /**
   * Streaming chat — yields raw SSE lines.
   * Caller is responsible for parsing token / citations / done / error events.
   */
  async *stream(message: string): AsyncGenerator<string> {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })

    if (!res.ok || !res.body) {
      throw new Error(`Chat request failed: ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          yield line.slice(6) // strip "data: " prefix
        }
      }
    }
  },

  /** Non-streaming fallback (used when LLM_STREAMING_ENABLED=false). */
  send: (message: string): Promise<ChatResponseBody> =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
}

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: (): Promise<{ status: string; version: string }> =>
    request("/health"),
}
