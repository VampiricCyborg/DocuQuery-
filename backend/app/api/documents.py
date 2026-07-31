from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import Document, DocumentChunk
from app.schemas import DocumentOut
from app.schemas.document import DocumentChunkOut
from app.services import list_documents, delete_document

router = APIRouter()


@router.get("/documents", response_model=list[DocumentOut])
async def get_documents(db: AsyncSession = Depends(get_db)):
    """Return all uploaded documents with their processing status."""
    return await list_documents(db)


@router.get("/documents/{doc_id}", response_model=DocumentOut)
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    """Return a single document by ID."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc


@router.get("/documents/{doc_id}/chunks", response_model=list[DocumentChunkOut])
async def get_document_chunks(doc_id: str, db: AsyncSession = Depends(get_db)):
    """Return all indexed chunks for a document (useful for debugging ingestion)."""
    result = await db.execute(
        select(DocumentChunk)
        .where(DocumentChunk.document_id == doc_id)
        .order_by(DocumentChunk.chunk_index)
    )
    chunks = result.scalars().all()
    if not chunks:
        raise HTTPException(status_code=404, detail="No chunks found. Document may not be indexed yet.")
    return chunks


@router.get("/documents/{doc_id}/debug")
async def debug_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    """
    Diagnostic endpoint — returns the document's indexing state:
    status, total_chunks recorded, actual chunk rows in DB,
    and whether embeddings are present.

    Use this to verify that a document was successfully indexed before querying it.
    """
    # Fetch document
    doc_result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = doc_result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Count actual chunk rows
    chunk_count_result = await db.execute(
        select(func.count()).where(DocumentChunk.document_id == doc_id)
    )
    actual_chunks = chunk_count_result.scalar_one()

    # Count chunks that have a non-null embedding
    embedded_count_result = await db.execute(
        select(func.count()).where(
            DocumentChunk.document_id == doc_id,
            DocumentChunk.embedding.is_not(None),
        )
    )
    embedded_chunks = embedded_count_result.scalar_one()

    return {
        "document_id": doc.id,
        "filename": doc.original_filename,
        "status": doc.status.value,
        "total_chunks_recorded": doc.total_chunks,
        "actual_chunk_rows": actual_chunks,
        "chunks_with_embeddings": embedded_chunks,
        "upload_time": doc.upload_time.isoformat() if doc.upload_time else None,
        "diagnosis": _diagnose(doc.status.value, actual_chunks, embedded_chunks),
    }


def _diagnose(status: str, actual_chunks: int, embedded_chunks: int) -> str:
    if status == "uploaded":
        return "Document is queued — ingestion has not started yet."
    if status == "processing":
        return "Ingestion is currently in progress."
    if status == "failed":
        return "Ingestion failed — check application logs for the error."
    if status == "indexed":
        if actual_chunks == 0:
            return "BUG: status=indexed but no chunk rows exist. Ingestion committed status but not chunks."
        if embedded_chunks == 0:
            return "BUG: chunks exist but none have embeddings. Embedding generation may have failed."
        if embedded_chunks < actual_chunks:
            return f"PARTIAL: {embedded_chunks}/{actual_chunks} chunks have embeddings."
        return f"OK: {actual_chunks} chunks with embeddings — document is ready for retrieval."
    return f"Unknown status: {status!r}"


@router.delete("/documents/{doc_id}", status_code=204)
async def remove_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a document and all its chunks (cascade)."""
    await delete_document(doc_id, db)
