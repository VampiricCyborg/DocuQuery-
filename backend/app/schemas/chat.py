"""Chat request/response schemas for Phase 5."""

from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    top_k: int | None = Field(default=None, ge=1, le=20)
    # conversation_id reserved for Phase 8 (session memory)
    conversation_id: str | None = None
    mode: Literal["docuquery", "llm", "hybrid"] = "docuquery"


class CitationOut(BaseModel):
    document_id: str
    filename: str
    page: int
    chunk_index: int
    source_type: Literal["document", "web"] = "document"
    title: str | None = None
    url: str | None = None


class ChatResponse(BaseModel):
    answer: str
    citations: list[CitationOut]
    model: str
    conversation_id: str | None = None
