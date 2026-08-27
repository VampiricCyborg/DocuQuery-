"""
Retrieval pipeline orchestrator.

Phase 5 calls run_retrieval_pipeline() and receives a RetrievalResult
containing context + citations — ready to pass to an LLM.

No FastAPI code here.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.database.models import Document
from app.retrieval.embedding_query import embed_query
from app.retrieval.filters import RetrievalFilter, build_where_clauses
from app.retrieval.vector_search import similarity_search
from app.retrieval.scoring import normalize_scores
from app.retrieval.context_builder import build_context
from app.retrieval.citations import Citation, extract_citations
from app.retrieval.exceptions import NoResultsError
from app.web_search import WebSearchResult

logger = logging.getLogger(__name__)


@dataclass
class ChunkResult:
    document_id: str
    filename: str
    page: int
    chunk_index: int
    similarity: float
    text: str


@dataclass
class RetrievalResult:
    query: str
    chunks: list[ChunkResult]
    context: str
    citations: list[Citation]
    total_retrieved: int
    web_sources: list[WebSearchResult] = field(default_factory=list)


async def run_retrieval_pipeline(
    query: str,
    db: AsyncSession,
    user_id: str,
    top_k: int | None = None,
    filters: RetrievalFilter | None = None,
) -> RetrievalResult:
    """
    Full retrieval pipeline:
      1. Embed query
      2. Build filter clauses
      3. Vector search
      4. Score normalisation + deduplication + ranking
      5. Context assembly
      6. Citation extraction
    """
    settings = get_settings()
    effective_top_k = top_k or settings.retrieval_top_k

    logger.info(
        "[retrieval] ===== START query=%r  top_k=%d  threshold=%.2f  filters=%s =====",
        query, effective_top_k, settings.retrieval_similarity_threshold, filters,
    )

    # 1. Embed
    query_vector = await embed_query(query)
    logger.info("[retrieval] [1/4] Query embedded  dim=%d", len(query_vector))

    # 2. Filters
    where_clauses = build_where_clauses(filters)
    where_clauses.append(Document.user_id == user_id)
    logger.info("[retrieval] [2/4] Filter clauses built  count=%d", len(where_clauses))

    # 3. Vector search — fetch 2× top_k to give scoring room after dedup/threshold
    fetch_k = effective_top_k * 2
    logger.info("[retrieval] [3/4] Running vector search  fetch_k=%d", fetch_k)
    raw_results = await similarity_search(
        query_vector=query_vector,
        db=db,
        top_k=fetch_k,
        where_clauses=where_clauses,
    )
    logger.info("[retrieval] [3/4] Raw results: %d rows returned", len(raw_results))

    if raw_results:
        for i, (chunk, dist) in enumerate(raw_results[:3]):
            similarity = round(max(0.0, min(1.0, 1.0 - dist / 2.0)), 4)
            logger.info(
                "[retrieval]   top-%d  chunk_id=%s  doc_id=%s  similarity=%.4f  page=%d",
                i + 1, chunk.id, chunk.document_id, similarity, chunk.page_number,
            )
    else:
        logger.warning(
            "[retrieval] [3/4] Vector search returned 0 rows — "
            "documents may not be indexed or embeddings are missing"
        )

    # 4. Score normalisation
    scored = normalize_scores(
        raw=raw_results,
        threshold=settings.retrieval_similarity_threshold,
        max_chunks=min(effective_top_k, settings.retrieval_max_context_chunks),
    )

    logger.info(
        "[retrieval] [4/4] After scoring: %d raw → %d above threshold=%.2f",
        len(raw_results), len(scored), settings.retrieval_similarity_threshold,
    )

    if not scored:
        logger.warning(
            "[retrieval] No chunks above threshold=%.2f  "
            "(raw=%d, lower the threshold if documents are indexed)",
            settings.retrieval_similarity_threshold, len(raw_results),
        )
        raise NoResultsError(f"No chunks found above threshold for query: {query!r}")

    chunks_only = [chunk for chunk, _ in scored]

    # 5. Context
    context = build_context(chunks_only)
    logger.info("[retrieval] Context built  chars=%d  chunks=%d", len(context), len(chunks_only))

    # 6. Citations
    citations = extract_citations(chunks_only)

    chunk_results = [
        ChunkResult(
            document_id=chunk.document_id,
            filename=chunk.metadata_.get("filename", "unknown"),
            page=chunk.page_number,
            chunk_index=chunk.chunk_index,
            similarity=score,
            text=chunk.text,
        )
        for chunk, score in scored
    ]

    logger.info(
        "[retrieval] ===== END  chunks=%d  citations=%d =====",
        len(chunk_results), len(citations),
    )

    return RetrievalResult(
        query=query,
        chunks=chunk_results,
        context=context,
        citations=citations,
        total_retrieved=len(raw_results),
    )
