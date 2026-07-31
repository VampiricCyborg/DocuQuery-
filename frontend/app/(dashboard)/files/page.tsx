"use client"
import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { FileUploadZone, FileList } from "@/components/file-upload/FileUploadZone"
import { useFileStore } from "@/stores/file.store"
import { cn } from "@/lib/utils"

/**
 * Reads ?highlight=<document_id> from the URL and highlights
 * the matching file card.  This is navigated to from CitationCard's
 * "View in Files" button.
 */
function FilesContent() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get("highlight")
  const { files, loadFiles } = useFileStore()

  useEffect(() => { void loadFiles() }, [loadFiles])

  // Scroll to highlighted file when the component mounts or highlightId changes
  useEffect(() => {
    if (highlightId) {
      document.getElementById(`document-${highlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [highlightId])

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-white">Files</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Upload documents for RAG retrieval
          </p>
          {highlightId && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2"
            >
              📍 Navigated from a citation — the referenced document is highlighted below
            </motion.p>
          )}
        </div>

        {/* Upload zone */}
        <FileUploadZone />

        {/* File list with optional highlight */}
        <div className="space-y-2">
          {files.map(file => {
            const isHighlighted = highlightId && file.id === highlightId
            return (
              <div
                key={file.id}
                ref={undefined}
                className={cn(
                  "hidden rounded-xl transition-all duration-500",
                  isHighlighted && "ring-2 ring-blue-500/60 ring-offset-1 ring-offset-neutral-950"
                )}
              >
                {isHighlighted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-t-xl bg-blue-500/10 px-3 py-1.5 text-[11px] text-blue-300 border border-blue-500/20 border-b-0"
                  >
                    📌 Referenced in citation
                  </motion.div>
                )}
                {/* FileList renders its own cards; we need to render inline here for highlight support */}
              </div>
            )
          })}
        </div>

        {/* Standard file list (always shown) */}
        <FileList highlightId={highlightId} />
      </div>
    </div>
  )
}

export default function FilesPage() {
  return (
    <Suspense fallback={<div className="flex-1 p-6"><div className="text-neutral-500 text-sm">Loading...</div></div>}>
      <FilesContent />
    </Suspense>
  )
}
