"""Internal data models for the LLM layer."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class LLMRequest:
    """Everything a provider needs to generate a response."""
    system_prompt: str
    user_message: str
    context: str
    model: str
    temperature: float
    max_tokens: int


@dataclass
class CitationRecord:
    document_id: str
    filename: str
    page: int
    chunk_index: int


@dataclass
class LLMResponse:
    """Structured response returned by response_generator."""
    answer: str
    citations: list[CitationRecord]
    model: str
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
