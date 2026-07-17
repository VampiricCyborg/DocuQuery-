"""
Scoring utilities: distance → similarity, threshold filtering, deduplication, ranking.

Centralised here so Phase 6 can inject reranker scores without touching
vector_search.py or the pipeline.
"""

from __future__ import annotations

from app.database.models import DocumentChunk


def cosine_distance_to_similarity(distance: float) -> float:
    """
    Convert pgvector cosine distance [0, 2] → similarity [0, 1].
    cosine_similarity = 1 - (distance / 2)
    """
    return round(max(0.0, min(1.0, 1.0 - distance / 2.0)), 6)


def apply_threshold(
    scored: list[tuple[DocumentChunk, float]],
    threshold: float,
) -> list[tuple[DocumentChunk, float]]:
    """Drop chunks whose similarity score is below the threshold."""
    return [(chunk, score) for chunk, score in scored if score >= threshold]


def deduplicate(
    scored: list[tuple[DocumentChunk, float]],
) -> list[tuple[DocumentChunk, float]]:
    """Remove duplicate chunk IDs, keeping the highest-scoring occurrence."""
    seen: set[str] = set()
    result = []
    for chunk, score in scored:
        if chunk.id not in seen:
            seen.add(chunk.id)
            result.append((chunk, score))
    return result


def rank(
    scored: list[tuple[DocumentChunk, float]],
    max_chunks: int,
) -> list[tuple[DocumentChunk, float]]:
    """Sort by descending similarity and cap at max_chunks."""
    return sorted(scored, key=lambda x: x[1], reverse=True)[:max_chunks]


def normalize_scores(
    raw: list[tuple[DocumentChunk, float]],
    threshold: float,
    max_chunks: int,
) -> list[tuple[DocumentChunk, float]]:
    """
    Full scoring pipeline:
      1. Convert distances to similarities
      2. Threshold filter
      3. Deduplicate
      4. Rank and cap
    """
    scored = [(chunk, cosine_distance_to_similarity(dist)) for chunk, dist in raw]
    scored = apply_threshold(scored, threshold)
    scored = deduplicate(scored)
    return rank(scored, max_chunks)
