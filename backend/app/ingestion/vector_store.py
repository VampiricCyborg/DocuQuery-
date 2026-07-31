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

    NOTE: This function calls db.flush() only — NOT db.commit().
    The caller (pipeline.py) is responsible for committing the transaction.
    """
    if len(chunks) != len(embeddings):
        raise ValueError(
            f"chunks/embeddings length mismatch: {len(chunks)} chunks vs {len(embeddings)} embeddings"
        )

    if not chunks:
        logger.warning("[vector_store] store_chunks called with empty chunk list — nothing stored")
        return

    # Validate embedding dimensions on the first vector before inserting anything
    first_dim = len(embeddings[0]) if embeddings else 0
    from app.database.models import EMBEDDING_DIM
    if first_dim != EMBEDDING_DIM:
        raise ValueError(
            f"Embedding dimension mismatch: model produced {first_dim}-dim vectors "
            f"but table expects {EMBEDDING_DIM}-dim (EMBEDDING_DIM)"
        )

    doc_id = chunks[0].document_id
    logger.info(
        "[vector_store] Preparing %d DocumentChunk rows  doc_id=%s  embedding_dim=%d",
        len(chunks), doc_id, first_dim,
    )

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
    logger.info(
        "[vector_store] Flushed %d chunks to session (pending commit)  doc_id=%s",
        len(db_chunks), doc_id,
    )
