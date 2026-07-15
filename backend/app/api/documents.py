from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
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


@router.delete("/documents/{doc_id}", status_code=204)
async def remove_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a document and all its chunks (cascade)."""
    await delete_document(doc_id, db)
