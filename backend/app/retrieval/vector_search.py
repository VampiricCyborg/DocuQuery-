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

from app.database.models import Document, DocumentChunk
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

        # <=> is the pgvector cosine distance operator
        distance_expr = DocumentChunk.embedding.cosine_distance(query_vector)

        stmt = (
            select(DocumentChunk, distance_expr.label("distance"))
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(Document.status == "indexed")  # only search fully indexed docs
        )

        if where_clauses:
            stmt = stmt.where(*where_clauses)

        stmt = stmt.order_by(distance_expr).limit(top_k)

        result = await db.execute(stmt)
        rows = result.all()

        latency_ms = (time.perf_counter() - t0) * 1000
        logger.info(
            "[retrieval] Vector search returned %d rows in %.1f ms (top_k=%d)",
            len(rows), latency_ms, top_k,
        )

        return [(row.DocumentChunk, float(row.distance)) for row in rows]

    except VectorSearchError:
        raise
    except Exception as exc:
        raise VectorSearchError(f"Vector search failed: {exc}") from exc
