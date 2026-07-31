"""
POST /chat — RAG chat endpoint.

Pipeline:
  1. Run retrieval pipeline
  2. Pass RetrievalResult to ResponseGenerator
  3. Stream SSE tokens + citations to client

No prompt logic here — all business logic lives in app/llm/.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.chat import ChatRequest, ChatResponse, CitationOut
from app.retrieval.retrieval_pipeline import RetrievalResult
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
from app.web_search import build_web_context, search_web

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/chat")
@limiter.limit(lambda: get_settings().rate_limit_chat)
async def chat(
    request: Request,
    chat_request: Annotated[ChatRequest, Body(...)],
    db: AsyncSession = Depends(get_db),
):
    """
    Streaming RAG chat.

    Returns text/event-stream when streaming is enabled,
    or a JSON ChatResponse when streaming is disabled.
    """
    settings = get_settings()

    # LLM mode intentionally skips retrieval. DocuQuery and Hybrid use the
    # same grounded retrieval pipeline, while Hybrid's prompt also allows
    # general reasoning beyond the retrieved excerpts.
    if chat_request.mode == "llm":
        retrieval_result = RetrievalResult(
            query=chat_request.message, chunks=[], context="", citations=[], total_retrieved=0
        )
    else:
        try:
            retrieval_result = await run_retrieval_pipeline(
                query=chat_request.message,
                db=db,
                top_k=chat_request.top_k,
                filters=None,
            )
        except (EmbeddingError, VectorSearchError) as exc:
            logger.error("[chat] Retrieval error: %s", exc)
            raise HTTPException(status_code=503, detail="Retrieval service unavailable.")
        except NoResultsError:
            if chat_request.mode == "hybrid":
                retrieval_result = RetrievalResult(
                    query=chat_request.message, chunks=[], context="", citations=[], total_retrieved=0
                )
            else:
                # Return a graceful no-results response rather than a 404.
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
                    conversation_id=chat_request.conversation_id,
                )

    if chat_request.mode == "hybrid":
        web_sources = await search_web(chat_request.message)
        web_context = build_web_context(web_sources)
        if web_context:
            retrieval_result.context = f"{retrieval_result.context}\n\n{web_context}".strip()
            retrieval_result.web_sources = web_sources

    generator = get_response_generator()

    # --- Streaming path ---
    if settings.llm_streaming_enabled:
        async def _stream():
            try:
                async for event in generator.stream(chat_request.message, retrieval_result, chat_request.mode):
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
        llm_response = await generator.generate(chat_request.message, retrieval_result, chat_request.mode)
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
                source_type=c.source_type,
                title=c.title,
                url=c.url,
            )
            for c in llm_response.citations
        ],
        model=llm_response.model,
        conversation_id=chat_request.conversation_id,
    )
