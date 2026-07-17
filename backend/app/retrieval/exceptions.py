"""Custom exceptions for the retrieval engine."""


class RetrievalError(Exception):
    """Base class for all retrieval errors."""


class EmbeddingError(RetrievalError):
    """Failed to generate query embedding."""


class VectorSearchError(RetrievalError):
    """Database error during vector search."""


class NoResultsError(RetrievalError):
    """Query returned zero chunks above the similarity threshold."""


class InvalidFilterError(RetrievalError):
    """Caller supplied an unsupported or malformed filter."""
