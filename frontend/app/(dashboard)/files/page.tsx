"use client"
import { FileUploadZone, FileList } from "@/components/file-upload/FileUploadZone"

export default function FilesPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Files</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Upload documents for RAG retrieval</p>
        </div>
        <FileUploadZone />
        <FileList />
      </div>
    </div>
  )
}
