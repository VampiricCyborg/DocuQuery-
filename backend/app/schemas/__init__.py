from app.schemas.document import DocumentOut, DocumentChunkOut
from app.schemas.upload import UploadResponse

# Chat schemas (Phase 5 will expand these)
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    answer: str
    conversation_id: str | None = None


__all__ = [
    "DocumentOut", "DocumentChunkOut",
    "UploadResponse",
    "ChatRequest", "ChatResponse",
]
