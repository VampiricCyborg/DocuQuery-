from fastapi import APIRouter
from app.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    """Stub endpoint — RAG pipeline wired in Phase 3."""
    return ChatResponse(
        answer="Backend connected successfully.",
        conversation_id=body.conversation_id,
    )
