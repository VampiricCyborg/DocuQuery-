"""
Embedding service — singleton wrapper around SentenceTransformers.
Lazy-loads the model on first call; batches inputs for throughput.
"""

import logging
from typing import ClassVar

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    _instance: ClassVar["EmbeddingService | None"] = None
    _model = None

    def __new__(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _load_model(self):
        if self._model is not None:
            return
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            raise RuntimeError("sentence-transformers not installed.")

        settings = get_settings()
        logger.info("Loading embedding model: %s", settings.embedding_model)
        self._model = SentenceTransformer(settings.embedding_model)
        logger.info("Embedding model loaded.")

    def embed(self, texts: list[str]) -> list[list[float]]:
        """Embed a list of strings. Returns list of float vectors."""
        self._load_model()
        settings = get_settings()
        vectors = self._model.encode(
            texts,
            batch_size=settings.embedding_batch_size,
            show_progress_bar=False,
            normalize_embeddings=True,
        )
        return [v.tolist() for v in vectors]


def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()
