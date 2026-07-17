"""
Citation extraction from retrieved DocumentChunk objects.

Each citation is a lightweight, serialisable record.
Phase 10 can extend this with highlight_offsets and PDF coordinates.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.database.models import DocumentChunk


@dataclass(frozen=True)
class Citation:
    document_id: str
    filename: str
    page: int
    chunk_index: int
    # Phase 10 extensions (reserved):
    # highlight_start: int | None = None
    # highlight_end: int | None = None
    # pdf_bbox: tuple[float, float, float, float] | None = None


def extract_citation(chunk: DocumentChunk) -> Citation:
    filename = chunk.metadata_.get("filename", "unknown")
    return Citation(
        document_id=chunk.document_id,
        filename=filename,
        page=chunk.page_number,
        chunk_index=chunk.chunk_index,
    )


def extract_citations(chunks: list[DocumentChunk]) -> list[Citation]:
    return [extract_citation(c) for c in chunks]
