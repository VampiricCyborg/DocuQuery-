"""Phase 4 — Enterprise Retrieval Engine."""

from app.retrieval.retrieval_pipeline import run_retrieval_pipeline, RetrievalResult, ChunkResult
from app.retrieval.filters import RetrievalFilter
from app.retrieval.citations import Citation
from app.retrieval.exceptions import (
    RetrievalError,
    EmbeddingError,
    VectorSearchError,
    NoResultsError,
    InvalidFilterError,
)

__all__ = [
    "run_retrieval_pipeline",
    "RetrievalResult",
    "ChunkResult",
    "RetrievalFilter",
    "Citation",
    "RetrievalError",
    "EmbeddingError",
    "VectorSearchError",
    "NoResultsError",
    "InvalidFilterError",
]
