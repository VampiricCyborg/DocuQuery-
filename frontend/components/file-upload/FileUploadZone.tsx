"use client"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, Image, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { useFileStore } from "@/stores/file.store"
import { cn, formatBytes } from "@/lib/utils"
import type { FileAttachment } from "@/types"

const ACCEPTED = { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "text/plain": [".txt"], "image/*": [".png", ".jpg", ".jpeg", ".webp"] }

export function FileUploadZone() {
  const { addFile } = useFileStore()

  const onDrop = useCallback((accepted: File[]) => {
    accepted.forEach(f => addFile(f))
  }, [addFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: ACCEPTED, multiple: true })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer",
        isDragActive
          ? "border-blue-500 bg-blue-500/5"
          : "border-neutral-700 hover:border-neutral-500 hover:bg-white/[0.02]"
      )}
    >
      <input {...getInputProps()} />
      <motion.div animate={{ scale: isDragActive ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 300 }}>
        <Upload className={cn("h-10 w-10 mb-3", isDragActive ? "text-blue-400" : "text-neutral-500")} />
      </motion.div>
      <p className="text-sm font-medium text-neutral-300">
        {isDragActive ? "Drop files here" : "Drag & drop files here"}
      </p>
      <p className="mt-1 text-xs text-neutral-600">PDF, DOCX, TXT, PNG, JPG — up to 50MB each</p>
      <button
        type="button"
        className="mt-4 rounded-lg border border-neutral-700 px-4 py-2 text-xs text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors"
        onClick={e => e.stopPropagation()}
      >
        Browse files
      </button>
    </div>
  )
}

export function FileList() {
  const { files, removeFile } = useFileStore()

  if (files.length === 0) return null

  return (
    <div className="mt-4 space-y-2">
      <AnimatePresence>
        {files.map(f => <FileCard key={f.id} file={f} onRemove={() => removeFile(f.id)} />)}
      </AnimatePresence>
    </div>
  )
}

function FileCard({ file, onRemove }: { file: FileAttachment; onRemove: () => void }) {
  const Icon = file.type === "pdf" ? FileText : file.type === "image" ? Image : File

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
        <Icon className="h-4 w-4 text-neutral-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white">{file.name}</p>
        <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
        {file.status === "uploading" && (
          <div className="mt-1.5 h-1 w-full rounded-full bg-neutral-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${file.progress ?? 0}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
      <div className="shrink-0">
        {file.status === "ready" && <CheckCircle className="h-4 w-4 text-green-400" />}
        {file.status === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
        {file.status === "uploading" && (
          <span className="text-xs text-neutral-500">{file.progress}%</span>
        )}
      </div>
      <button onClick={onRemove} className="shrink-0 rounded-md p-1 text-neutral-600 hover:bg-neutral-800 hover:text-white transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
