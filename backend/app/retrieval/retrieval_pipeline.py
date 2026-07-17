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
from app.retrieval.embedding_query import embed_query
from app.retrieval.filters import RetrievalFilter, build_where_clauses
from app.retrieval.vector_search import similarity_search
from app.retrieval.scoring import normalize_scores
from app.retrieval.context_builder import build_context
from app.retrieval.citations import Citation, extract_citations
from app.retrieval.exceptions import NoResultsError

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


async def run_retrieval_pipeline(
    query: str,
    db: AsyncSession,
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

    logger.info("[retrieval] Query: %r  top_k=%d  filters=%s", query, effective_top_k, filters)

    # 1. Embed
    query_vector = await embed_query(query)

    # 2. Filters
    where_clauses = build_where_clauses(filters)

    # 3. Vector search — fetch 2× top_k to give scoring room after dedup/threshold
    raw_results = await similarity_search(
        query_vector=query_vector,
        db=db,
        top_k=effective_top_k * 2,
        where_clauses=where_clauses,
    )

    # 4. Score normalisation
    scored = normalize_scores(
        raw=raw_results,
        threshold=settings.retrieval_similarity_threshold,
        max_chunks=min(effective_top_k, settings.retrieval_max_context_chunks),
    )

    logger.info(
        "[retrieval] %d raw → %d after scoring (threshold=%.2f)",
        len(raw_results), len(scored), settings.retrieval_similarity_threshold,
    )

    if not scored:
        raise NoResultsError(f"No chunks found above threshold for query: {query!r}")

    chunks_only = [chunk for chunk, _ in scored]

    # 5. Context
    context = build_context(chunks_only)

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

    return RetrievalResult(
        query=query,
        chunks=chunk_results,
        context=context,
        citations=citations,
        total_retrieved=len(raw_results),
    )
