"""
Ingestion pipeline orchestrator.
Coordinates all ingestion stages for a single document.
No FastAPI logic here — callable from a route, a task queue, or a CLI.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import ProcessingStatus
from app.services.document_service import update_document_status
from app.ingestion.parser import parse_document
from app.ingestion.cleaner import clean_pages
from app.ingestion.chunker import chunk_pages
from app.ingestion.embeddings import get_embedding_service
from app.ingestion.vector_store import store_chunks

logger = logging.getLogger(__name__)


async def run_ingestion_pipeline(
    document_id: str,
    storage_path: str,
    filename: str,
    db: AsyncSession,
) -> None:
    """
    Full ingestion pipeline for one document.

    Stages:
        1. Parse  → list[ParsedPage]
        2. Clean  → list[ParsedPage]
        3. Chunk  → list[TextChunk]
        4. Embed  → list[list[float]]
        5. Store  → DocumentChunk rows in DB
        6. Status → INDEXED

    On any failure: status → FAILED, exception is logged and re-raised.
    """
    logger.info("[pipeline] Starting ingestion for document %s (%s)", document_id, filename)

    try:
        await update_document_status(document_id, ProcessingStatus.processing, db)

        # 1. Parse
        pages = parse_document(storage_path)
        if not pages:
            raise ValueError(f"No extractable text found in '{filename}'")
        logger.info("[pipeline] Parsed %d page(s)", len(pages))

        # 2. Clean
        pages = clean_pages(pages)

        # 3. Chunk
        chunks = chunk_pages(pages, document_id=document_id, filename=filename)
        if not chunks:
            raise ValueError(f"Chunking produced 0 chunks for '{filename}'")

        # 4. Embed
        embedding_service = get_embedding_service()
        texts = [c.text for c in chunks]
        embeddings = embedding_service.embed(texts)
        logger.info("[pipeline] Generated %d embeddings", len(embeddings))

        # 5. Store vectors
        await store_chunks(chunks, embeddings, db)

        # 6. Mark indexed
        await update_document_status(
            document_id, ProcessingStatus.indexed, db, total_chunks=len(chunks)
        )
        await db.commit()
        logger.info("[pipeline] Document %s indexed with %d chunks", document_id, len(chunks))

    except Exception as exc:
        logger.error("[pipeline] Ingestion failed for %s: %s", document_id, exc, exc_info=True)
        try:
            await update_document_status(document_id, ProcessingStatus.failed, db)
            await db.commit()
        except Exception:
            pass
        raise
