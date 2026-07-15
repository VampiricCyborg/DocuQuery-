"""
Vector store — writes embedded chunks to PostgreSQL (pgvector).
Designed so Phase 4 can add similarity_search() here without touching ingestion.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import DocumentChunk
from app.ingestion.chunker import TextChunk

logger = logging.getLogger(__name__)


async def store_chunks(
    chunks: list[TextChunk],
    embeddings: list[list[float]],
    db: AsyncSession,
) -> None:
    """
    Persist chunks + their embeddings as DocumentChunk rows.
    Assumes len(chunks) == len(embeddings).
    """
    if len(chunks) != len(embeddings):
        raise ValueError("chunks and embeddings length mismatch")

    db_chunks = [
        DocumentChunk(
            document_id=chunk.document_id,
            chunk_index=chunk.chunk_index,
            page_number=chunk.page_number,
            text=chunk.text,
            embedding=embedding,
            metadata_={
                "filename": chunk.filename,
                "section": chunk.section,
                **chunk.metadata,
            },
        )
        for chunk, embedding in zip(chunks, embeddings)
    ]

    db.add_all(db_chunks)
    await db.flush()
    logger.info("Stored %d chunks for document %s", len(db_chunks), chunks[0].document_id if chunks else "?")
