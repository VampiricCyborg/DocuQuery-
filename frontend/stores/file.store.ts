import { create } from "zustand"
import type { FileAttachment } from "@/types"
import { generateId } from "@/lib/utils"
import { fileService } from "@/services/mock"

interface FileStore {
  files: FileAttachment[]
  addFile: (file: File) => Promise<void>
  removeFile: (id: string) => void
}

export const useFileStore = create<FileStore>()((set) => ({
  files: [],

  addFile: async (file) => {
    const ext = file.name.split(".").pop()?.toLowerCase()
    const type = ext === "pdf" ? "pdf" : ext === "docx" ? "docx" : ext === "txt" ? "txt" : ["jpg","jpeg","png","webp"].includes(ext ?? "") ? "image" : "other"
    const id = generateId()
    const entry: FileAttachment = { id, name: file.name, size: file.size, type, status: "uploading", progress: 0 }

    set(s => ({ files: [entry, ...s.files] }))

    await fileService.uploadFile(file, (progress) => {
      set(s => ({ files: s.files.map(f => f.id === id ? { ...f, progress } : f) }))
    })

    set(s => ({ files: s.files.map(f => f.id === id ? { ...f, status: "ready", progress: 100 } : f) }))
  },

  removeFile: (id) => set(s => ({ files: s.files.filter(f => f.id !== id) })),
}))
