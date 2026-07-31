"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, FileText, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Citation } from "@/types"
import { cn } from "@/lib/utils"

interface CitationCardProps {
  citation: Citation
  index: number
}

/**
 * Renders a single citation as a collapsible card.
 * Grouped by filename — each unique file gets one card.
 */
export function CitationCard({ citation, index }: CitationCardProps) {
  const [open, setOpen] = useState(true)
  const router = useRouter()

  const handleViewInFiles = () => {
    router.push(`/files?highlight=${encodeURIComponent(citation.document_id)}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-neutral-700/60 bg-neutral-800/40 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
        aria-expanded={open}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
          <FileText className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-neutral-100 leading-tight">
            {citation.filename}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Page {citation.page}
          </p>
        </div>
        <div className="shrink-0 text-neutral-500">
          {open
            ? <ChevronUp className="h-3.5 w-3.5" />
            : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-700/50 px-3.5 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-neutral-500 font-medium">Chunks</span>
                <div className="flex flex-wrap gap-1">
                  <ChunkBadge chunk={citation.chunk_index} />
                </div>
              </div>
              <button
                onClick={handleViewInFiles}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-700/60 px-2.5 py-1.5 text-[11px] font-medium text-neutral-300 hover:bg-neutral-600/60 hover:text-white transition-all"
              >
                <ExternalLink className="h-3 w-3" />
                View Document
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ChunkBadge({ chunk }: { chunk: number }) {
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500/20 px-1.5 text-[10px] font-semibold text-blue-300">
      {chunk}
    </span>
  )
}

// ─── CitationList ─────────────────────────────────────────────────────────────

interface CitationListProps {
  citations: Citation[]
}

/**
 * Groups multiple citations by filename and renders one CitationCard per unique file,
 * merging all chunk indices for that file.
 */
export function CitationList({ citations }: CitationListProps) {
  if (!citations || citations.length === 0) return null

  // Group by document_id, keeping the lowest page number and all chunk indices
  const grouped = citations.reduce<Record<string, Citation & { chunks: number[] }>>(
    (acc, c) => {
      if (!acc[c.document_id]) {
        acc[c.document_id] = { ...c, chunks: [c.chunk_index] }
      } else {
        acc[c.document_id].chunks.push(c.chunk_index)
        // Use the smallest page number as representative
        if (c.page < acc[c.document_id].page) {
          acc[c.document_id].page = c.page
        }
      }
      return acc
    },
    {}
  )

  const entries = Object.values(grouped)

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-neutral-700/50" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 px-1">
          📄 Sources
        </span>
        <div className="h-px flex-1 bg-neutral-700/50" />
      </div>
      {entries.map((entry, i) => (
        <GroupedCitationCard key={entry.document_id} entry={entry} index={i} />
      ))}
    </div>
  )
}

function GroupedCitationCard({
  entry,
  index,
}: {
  entry: Citation & { chunks: number[] }
  index: number
}) {
  const [open, setOpen] = useState(true)
  const router = useRouter()

  const uniqueChunks = [...new Set(entry.chunks)].sort((a, b) => a - b)

  const handleViewInFiles = () => {
    router.push(`/files?highlight=${encodeURIComponent(entry.document_id)}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-xl border border-neutral-700/60 bg-neutral-800/40 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
        aria-expanded={open}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
          <FileText className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-neutral-100 leading-tight">
            {entry.filename}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Page {entry.page}
          </p>
        </div>
        <div className="shrink-0 text-neutral-500">
          {open
            ? <ChevronUp className="h-3.5 w-3.5" />
            : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-700/50 px-3.5 py-2.5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-[11px] text-neutral-500 font-medium shrink-0">
                  Relevant chunks
                </span>
                <div className="flex flex-wrap gap-1">
                  {uniqueChunks.map(chunk => (
                    <span
                      key={chunk}
                      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500/20 px-1.5 text-[10px] font-semibold text-blue-300"
                    >
                      {chunk}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleViewInFiles}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5",
                  "text-[11px] font-medium text-neutral-300",
                  "bg-neutral-700/60 hover:bg-blue-600/30 hover:text-blue-300",
                  "transition-all duration-150"
                )}
              >
                <ExternalLink className="h-3 w-3" />
                View Document
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
