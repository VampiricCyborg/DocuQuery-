"""
Phase 5 LLM unit tests.
All tests are pure — no network, no model loading, no database.
"""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch, AsyncMock
from typing import AsyncGenerator

from app.llm.exceptions import (
    NoContextError,
    ProviderUnavailableError,
    RateLimitError,
)
from app.llm.models import LLMRequest, LLMResponse, CitationRecord
from app.llm.prompts import get_system_prompt, DEFAULT_PROMPT_VERSION
from app.llm.stream import token_event, citations_event, done_event, stream_with_citations
from app.llm.response_generator import ResponseGenerator, _truncate_context, _build_citations
from app.retrieval.retrieval_pipeline import RetrievalResult, ChunkResult


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_chunk_result(**kwargs) -> ChunkResult:
    defaults = dict(
        document_id="doc-1",
        filename="handbook.pdf",
        page=5,
        chunk_index=2,
        similarity=0.92,
        text="Employees receive 20 annual leave days.",
    )
    return ChunkResult(**{**defaults, **kwargs})


def _make_retrieval_result(chunks=None) -> RetrievalResult:
    if chunks is None:
        chunks = [_make_chunk_result()]
    context = "Document: handbook.pdf  |  Page: 5\n---\nEmployees receive 20 annual leave days." if chunks else ""
    return RetrievalResult(
        query="How many leave days?",
        chunks=chunks,
        context=context,
        citations=[],
        total_retrieved=len(chunks),
    )


class MockProvider:
    """In-memory provider — no network calls."""

    async def generate(self, request: LLMRequest) -> LLMResponse:
        return LLMResponse(
            answer="Employees receive 20 annual leave days.",
            citations=[],
            model=request.model,
            prompt_tokens=50,
            completion_tokens=10,
        )

    async def stream(self, request: LLMRequest) -> AsyncGenerator[str, None]:
        for token in ["Employees ", "receive ", "20 ", "days."]:
            yield token

    async def health_check(self) -> bool:
        return True


# ---------------------------------------------------------------------------
# prompts
# ---------------------------------------------------------------------------

class TestPrompts:
    def test_default_version_returns_string(self):
        prompt = get_system_prompt()
        assert isinstance(prompt, str)
        assert len(prompt) > 0

    def test_prompt_contains_grounding_instruction(self):
        prompt = get_system_prompt()
        assert "context" in prompt.lower()

    def test_unknown_version_raises(self):
        with pytest.raises(ValueError):
            get_system_prompt("v99")

    def test_default_version_constant_is_valid(self):
        get_system_prompt(DEFAULT_PROMPT_VERSION)  # must not raise


# ---------------------------------------------------------------------------
# stream utilities
# ---------------------------------------------------------------------------

class TestStreamUtils:
    def test_token_event_format(self):
        assert token_event("hello") == "data: hello\n\n"

    def test_done_event_format(self):
        assert done_event() == "data: [DONE]\n\n"

    def test_citations_event_contains_json(self):
        citations = [CitationRecord(document_id="d1", filename="f.pdf", page=1, chunk_index=0)]
        event = citations_event(citations)
        assert "event: citations" in event
        assert "f.pdf" in event

    def test_citations_event_empty_list(self):
        event = citations_event([])
        assert "[]" in event

    @pytest.mark.asyncio
    async def test_stream_with_citations_yields_tokens_then_citations_then_done(self):
        async def _tokens():
            for t in ["Hello ", "world"]:
                yield t

        events = []
        async for event in stream_with_citations(_tokens(), []):
            events.append(event)

        assert events[0] == "data: Hello \n\n"
        assert events[1] == "data: world\n\n"
        assert "event: citations" in events[2]
        assert events[3] == "data: [DONE]\n\n"


# ---------------------------------------------------------------------------
# response_generator internals
# ---------------------------------------------------------------------------

class TestResponseGeneratorInternals:
    def test_truncate_context_no_op_when_short(self):
        ctx = "short context"
        assert _truncate_context(ctx, max_tokens=1000) == ctx

    def test_truncate_context_cuts_long_context(self):
        ctx = "x" * 10_000
        result = _truncate_context(ctx, max_tokens=100)
        assert len(result) == 400  # 100 tokens * 4 chars

    def test_build_citations_maps_chunk_results(self):
        result = _make_retrieval_result()
        citations = _build_citations(result)
        assert len(citations) == 1
        assert citations[0].filename == "handbook.pdf"
        assert citations[0].page == 5

    def test_build_citations_empty_chunks(self):
        result = _make_retrieval_result(chunks=[])
        assert _build_citations(result) == []


# ---------------------------------------------------------------------------
# ResponseGenerator (mock provider)
# ---------------------------------------------------------------------------

class TestResponseGenerator:
    @pytest.mark.asyncio
    async def test_generate_returns_answer_with_citations(self):
        gen = ResponseGenerator(provider=MockProvider())
        result = _make_retrieval_result()

        with patch("app.llm.response_generator.get_settings") as mock_settings:
            s = MagicMock()
            s.llm_model = "llama-3.3-70b-versatile"
            s.llm_temperature = 0.1
            s.llm_max_tokens = 512
            s.llm_max_context_tokens = 3000
            s.llm_provider = "groq"
            mock_settings.return_value = s

            response = await gen.generate("How many leave days?", result)

        assert "20" in response.answer
        assert len(response.citations) == 1
        assert response.citations[0].filename == "handbook.pdf"

    @pytest.mark.asyncio
    async def test_generate_raises_no_context_on_empty_chunks(self):
        gen = ResponseGenerator(provider=MockProvider())
        empty_result = _make_retrieval_result(chunks=[])

        with patch("app.llm.response_generator.get_settings"):
            with pytest.raises(NoContextError):
                await gen.generate("question", empty_result)

    @pytest.mark.asyncio
    async def test_stream_yields_sse_events(self):
        gen = ResponseGenerator(provider=MockProvider())
        result = _make_retrieval_result()

        with patch("app.llm.response_generator.get_settings") as mock_settings:
            s = MagicMock()
            s.llm_model = "llama-3.3-70b-versatile"
            s.llm_temperature = 0.1
            s.llm_max_tokens = 512
            s.llm_max_context_tokens = 3000
            s.llm_provider = "groq"
            mock_settings.return_value = s

            events = []
            async for event in gen.stream("How many leave days?", result):
                events.append(event)

        # Should have token events + citations event + done event
        assert any("data: " in e for e in events)
        assert any("event: citations" in e for e in events)
        assert "data: [DONE]\n\n" in events

    @pytest.mark.asyncio
    async def test_stream_raises_no_context_on_empty_chunks(self):
        gen = ResponseGenerator(provider=MockProvider())
        empty_result = _make_retrieval_result(chunks=[])

        with patch("app.llm.response_generator.get_settings"):
            with pytest.raises(NoContextError):
                async for _ in gen.stream("question", empty_result):
                    pass


# ---------------------------------------------------------------------------
# provider factory
# ---------------------------------------------------------------------------

class TestProviderFactory:
    def test_unknown_provider_raises(self):
        from app.llm.providers import get_provider
        with pytest.raises(ValueError, match="Unknown LLM provider"):
            get_provider("nonexistent_provider")

    def test_groq_provider_instantiates(self):
        from app.llm.providers import get_provider
        provider = get_provider("groq", api_key="test-key")
        from app.llm.providers.groq_provider import GroqProvider
        assert isinstance(provider, GroqProvider)

    def test_ollama_provider_instantiates(self):
        from app.llm.providers import get_provider
        provider = get_provider("ollama")
        from app.llm.providers.ollama_provider import OllamaProvider
        assert isinstance(provider, OllamaProvider)

    def test_provider_names_are_case_insensitive(self):
        from app.llm.providers import get_provider
        p1 = get_provider("GROQ", api_key="k")
        p2 = get_provider("Groq", api_key="k")
        assert type(p1) == type(p2)
