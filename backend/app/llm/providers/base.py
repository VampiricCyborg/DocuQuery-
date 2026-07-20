"""Abstract base class for all LLM providers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import AsyncGenerator

from app.llm.models import LLMRequest, LLMResponse


class BaseLLMProvider(ABC):
    """
    Contract every provider must satisfy.

    Swapping providers requires only a config change — no application code changes.
    """

    @abstractmethod
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """Return a complete response (non-streaming)."""

    @abstractmethod
    async def stream(self, request: LLMRequest) -> AsyncGenerator[str, None]:
        """Yield response tokens one at a time."""

    @abstractmethod
    async def health_check(self) -> bool:
        """Return True if the provider is reachable."""
