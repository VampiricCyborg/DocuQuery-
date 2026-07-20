"""
app.llm public API.

get_response_generator() returns a singleton ResponseGenerator wired to
the configured provider. Call it from FastAPI dependencies.
"""

from __future__ import annotations

from functools import lru_cache

from app.llm.response_generator import ResponseGenerator
from app.llm.providers import get_provider


@lru_cache(maxsize=1)
def get_response_generator() -> ResponseGenerator:
    """Singleton — provider is instantiated once at first call."""
    from app.core.config import get_settings
    settings = get_settings()
    provider = get_provider(
        settings.llm_provider,
        api_key=settings.llm_api_key,
        ollama_base_url=settings.ollama_base_url,
        timeout=settings.llm_timeout,
    )
    return ResponseGenerator(provider=provider)


__all__ = ["get_response_generator", "ResponseGenerator"]
