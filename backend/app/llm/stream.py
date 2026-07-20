"""
SSE stream utilities.

Protocol (matches the existing frontend expectations):
  - Each token:   data: <token text>\\n\\n
  - Citations:    event: citations\\ndata: <json>\\n\\n
  - Done:         data: [DONE]\\n\\n
  - Error:        event: error\\ndata: <message>\\n\\n
"""

from __future__ import annotations

import json
from dataclasses import asdict
from typing import AsyncGenerator

from app.llm.models import CitationRecord


def token_event(token: str) -> str:
    return f"data: {token}\n\n"


def citations_event(citations: list[CitationRecord]) -> str:
    payload = json.dumps([asdict(c) for c in citations])
    return f"event: citations\ndata: {payload}\n\n"


def done_event() -> str:
    return "data: [DONE]\n\n"


def error_event(message: str) -> str:
    return f"event: error\ndata: {message}\n\n"


async def stream_with_citations(
    token_stream: AsyncGenerator[str, None],
    citations: list[CitationRecord],
) -> AsyncGenerator[str, None]:
    """
    Wrap a raw token stream with SSE framing.

    Yields token events, then a single citations event, then [DONE].
    """
    async for token in token_stream:
        yield token_event(token)
    yield citations_event(citations)
    yield done_event()
