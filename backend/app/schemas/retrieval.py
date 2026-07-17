from __future__ import annotations

from pydantic import BaseModel, Field


class RetrieveRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    top_k: int | None = Field(default=None, ge=1, le=50)
    filters: dict | None = None  # validated into RetrievalFilter inside the route


class ChunkResponse(BaseModel):
    document_id: str
    filename: str
    page: int
    chunk_index: int
    similarity: float
    text: str


class RetrieveResponse(BaseModel):
    query: str
    chunks: list[ChunkResponse]
    context: str
    total_retrieved: int
