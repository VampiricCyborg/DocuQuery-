"""
POST /chat — RAG chat endpoint.

Pipeline:
  1. Run retrieval pipeline
  2. Pass RetrievalResult to ResponseGenerator
  3. Stream SSE tokens + citations to client

No prompt logic here — all business logic lives in app/llm/.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.chat import ChatRequest, ChatResponse, CitationOut
from app.retrieval import run_retrieval_pipeline
from app.retrieval.exceptions import NoResultsError, EmbeddingError, VectorSearchError
from app.llm import get_response_generator
from app.llm.exceptions import (
    NoContextError,
    ProviderUnavailableError,
    RateLimitError,
    GenerationTimeoutError,
    MalformedResponseError,
)
from app.core.config import get_settings
from app.core.middleware import limiter

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/chat")
@limiter.limit(lambda: get_settings().rate_limit_chat)
async def chat(
    request: Request,
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Streaming RAG chat.

    Returns text/event-stream when streaming is enabled,
    or a JSON ChatResponse when streaming is disabled.
    """
    settings = get_settings()

    # --- Retrieval ---
    try:
        retrieval_result = await run_retrieval_pipeline(
            query=body.message,
            db=db,
            top_k=body.top_k,
            filters=None,
        )
    except (EmbeddingError, VectorSearchError) as exc:
        logger.error("[chat] Retrieval error: %s", exc)
        raise HTTPException(status_code=503, detail="Retrieval service unavailable.")
    except NoResultsError:
        # Return a graceful no-results response rather than a 404
        if settings.llm_streaming_enabled:
            async def _no_results():
                yield "data: I could not find relevant information in the available documents.\n\n"
                yield "event: citations\ndata: []\n\n"
                yield "data: [DONE]\n\n"
            return StreamingResponse(_no_results(), media_type="text/event-stream")
        return ChatResponse(
            answer="I could not find relevant information in the available documents.",
            citations=[],
            model=settings.llm_model,
            conversation_id=body.conversation_id,
        )

    generator = get_response_generator()

    # --- Streaming path ---
    if settings.llm_streaming_enabled:
        async def _stream():
            try:
                async for event in generator.stream(body.message, retrieval_result):
                    yield event
            except RateLimitError:
                yield "event: error\ndata: Rate limit reached. Please try again shortly.\n\n"
            except GenerationTimeoutError:
                yield "event: error\ndata: The request timed out. Please try again.\n\n"
            except ProviderUnavailableError:
                yield "event: error\ndata: AI service is temporarily unavailable.\n\n"
            except (NoContextError, MalformedResponseError) as exc:
                logger.error("[chat] Generation error: %s", exc)
                yield "event: error\ndata: Failed to generate a response.\n\n"

        return StreamingResponse(_stream(), media_type="text/event-stream")

    # --- Non-streaming path ---
    try:
        llm_response = await generator.generate(body.message, retrieval_result)
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit reached. Please try again shortly.")
    except GenerationTimeoutError:
        raise HTTPException(status_code=504, detail="The request timed out.")
    except ProviderUnavailableError as exc:
        logger.error("[chat] Provider unavailable: %s", exc)
        raise HTTPException(status_code=503, detail="AI service is temporarily unavailable.")
    except (NoContextError, MalformedResponseError) as exc:
        logger.error("[chat] Generation error: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to generate a response.")

    return ChatResponse(
        answer=llm_response.answer,
        citations=[
            CitationOut(
                document_id=c.document_id,
                filename=c.filename,
                page=c.page,
                chunk_index=c.chunk_index,
            )
            for c in llm_response.citations
        ],
        model=llm_response.model,
        conversation_id=body.conversation_id,
    )
