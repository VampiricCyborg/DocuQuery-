"""Chat request/response schemas for Phase 5."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    top_k: int | None = Field(default=None, ge=1, le=20)
    # conversation_id reserved for Phase 8 (session memory)
    conversation_id: str | None = None


class CitationOut(BaseModel):
    document_id: str
    filename: str
    page: int
    chunk_index: int


class ChatResponse(BaseModel):
    answer: str
    citations: list[CitationOut]
    model: str
    conversation_id: str | None = None
