"""
Ingestion pipeline orchestrator.
Coordinates all ingestion stages for a single document.
No FastAPI logic here — callable from a route, a task queue, or a CLI.

Transaction ownership: ALL db.commit() calls live here.
document_service.update_document_status intentionally does NOT commit.
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
        5. Store  → DocumentChunk rows flushed to DB
        6. Commit → chunks + status atomically written
        7. Status → INDEXED

    On any failure: status → FAILED, exception is logged and suppressed
    (background tasks must not propagate to FastAPI).
    """
    logger.info(
        "[pipeline] ===== START ingestion document_id=%s filename=%r =====",
        document_id, filename,
    )

    try:
        # Mark as PROCESSING and commit so the status is visible immediately
        await update_document_status(document_id, ProcessingStatus.processing, db)
        await db.commit()
        logger.info("[pipeline] [1/6] Status → PROCESSING  document_id=%s", document_id)

        # 1. Parse
        logger.info("[pipeline] [2/6] Parsing  path=%r", storage_path)
        pages = parse_document(storage_path)
        if not pages:
            raise ValueError(f"No extractable text found in '{filename}'")
        logger.info("[pipeline] [2/6] Parsed %d page(s)", len(pages))

        # 2. Clean
        pages = clean_pages(pages)
        logger.info("[pipeline] [3/6] Cleaned %d page(s)", len(pages))

        # 3. Chunk
        chunks = chunk_pages(pages, document_id=document_id, filename=filename)
        if not chunks:
            raise ValueError(f"Chunking produced 0 chunks for '{filename}'")
        logger.info("[pipeline] [4/6] Produced %d chunk(s)", len(chunks))

        # 4. Embed
        logger.info("[pipeline] [5/6] Embedding %d texts…", len(chunks))
        embedding_service = get_embedding_service()
        texts = [c.text for c in chunks]
        embeddings = embedding_service.embed(texts)
        if not embeddings:
            raise ValueError("Embedding service returned 0 vectors")
        logger.info(
            "[pipeline] [5/6] Generated %d embeddings  dim=%d",
            len(embeddings),
            len(embeddings[0]) if embeddings else 0,
        )

        # 5. Flush chunks to the session (NOT committed yet)
        await store_chunks(chunks, embeddings, db)
        logger.info("[pipeline] [5/6] Chunks flushed to session (pending commit)")

        # 6. Update status to INDEXED and commit everything atomically:
        #    - the DocumentChunk rows flushed above
        #    - the status change below
        await update_document_status(
            document_id, ProcessingStatus.indexed, db, total_chunks=len(chunks)
        )
        await db.commit()
        logger.info(
            "[pipeline] [6/6] COMMITTED  document_id=%s  chunks=%d  status=INDEXED",
            document_id, len(chunks),
        )

    except Exception as exc:
        logger.error(
            "[pipeline] ===== FAILED document_id=%s error=%s =====",
            document_id, exc,
            exc_info=True,
        )
        try:
            # Roll back any pending unflushed state before writing FAILED status
            await db.rollback()
            await update_document_status(document_id, ProcessingStatus.failed, db)
            await db.commit()
            logger.info("[pipeline] Status → FAILED  document_id=%s", document_id)
        except Exception as inner_exc:
            logger.error(
                "[pipeline] Could not write FAILED status for document_id=%s: %s",
                document_id, inner_exc,
            )
        # Do NOT re-raise: background tasks must exit cleanly so FastAPI doesn't
        # log an unhandled exception and the request-response cycle is unaffected.

    logger.info(
        "[pipeline] ===== END ingestion document_id=%s =====",
        document_id,
    )
