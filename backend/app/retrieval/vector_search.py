"""
Vector similarity search against PostgreSQL + pgvector.

Returns raw (DocumentChunk, distance) pairs — scoring.py handles
normalisation and threshold filtering so this stays a pure DB concern.
"""

import logging
import time
from typing import TYPE_CHECKING

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Document, DocumentChunk, ProcessingStatus
from app.retrieval.exceptions import VectorSearchError

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


async def similarity_search(
    query_vector: list[float],
    db: AsyncSession,
    top_k: int,
    where_clauses: list,
) -> list[tuple[DocumentChunk, float]]:
    """
    Retrieve the top_k closest chunks by cosine distance.

    Returns a list of (DocumentChunk, cosine_distance) tuples.
    Distance is in [0, 2] — scoring.py converts to similarity in [0, 1].
    """
    try:
        t0 = time.perf_counter()

        logger.info(
            "[vector_search] query_dim=%d  top_k=%d  extra_clauses=%d",
            len(query_vector),
            top_k,
            len(where_clauses),
        )

        # <=> is the pgvector cosine distance operator
        distance_expr = DocumentChunk.embedding.cosine_distance(query_vector)

        # IMPORTANT: compare against the enum member, NOT a raw string.
        # Using a raw string ("indexed") can silently return 0 rows with some
        # SQLAlchemy / pgvector combinations even though the stored value matches.
        stmt = (
            select(DocumentChunk, distance_expr.label("distance"))
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(Document.status == ProcessingStatus.indexed)  # ← enum member, not string
        )

        if where_clauses:
            stmt = stmt.where(*where_clauses)

        stmt = stmt.order_by(distance_expr).limit(top_k)

        result = await db.execute(stmt)
        rows = result.all()

        latency_ms = (time.perf_counter() - t0) * 1000

        if rows:
            distances = [float(row.distance) for row in rows]
            logger.info(
                "[vector_search] returned %d rows in %.1f ms  "
                "best_distance=%.4f  worst_distance=%.4f",
                len(rows), latency_ms, distances[0], distances[-1],
            )
        else:
            logger.warning(
                "[vector_search] returned 0 rows in %.1f ms  top_k=%d  "
                "— check that documents have status=INDEXED and embeddings exist",
                latency_ms, top_k,
            )

        return [(row.DocumentChunk, float(row.distance)) for row in rows]

    except VectorSearchError:
        raise
    except Exception as exc:
        logger.error("[vector_search] query failed: %s", exc, exc_info=True)
        raise VectorSearchError(f"Vector search failed: {exc}") from exc
