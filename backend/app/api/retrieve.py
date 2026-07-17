"""
POST /retrieve — thin FastAPI route.
All business logic lives in app/retrieval/.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.retrieval import RetrieveRequest, RetrieveResponse, ChunkResponse
from app.retrieval import run_retrieval_pipeline
from app.retrieval.filters import RetrievalFilter
from app.retrieval.exceptions import (
    NoResultsError,
    EmbeddingError,
    VectorSearchError,
    InvalidFilterError,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/retrieve", response_model=RetrieveResponse, status_code=status.HTTP_200_OK)
async def retrieve(
    body: RetrieveRequest,
    db: AsyncSession = Depends(get_db),
) -> RetrieveResponse:
    # Parse optional filters dict into the typed model
    try:
        filters = RetrievalFilter(**body.filters) if body.filters else None
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    try:
        result = await run_retrieval_pipeline(
            query=body.query,
            db=db,
            top_k=body.top_k,
            filters=filters,
        )
    except InvalidFilterError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except EmbeddingError as exc:
        logger.error("[retrieve] Embedding error: %s", exc)
        raise HTTPException(status_code=503, detail="Embedding service unavailable.")
    except VectorSearchError as exc:
        logger.error("[retrieve] Vector search error: %s", exc)
        raise HTTPException(status_code=503, detail="Vector search failed.")
    except NoResultsError:
        # Return an empty result rather than a 404 — callers handle empty gracefully
        return RetrieveResponse(
            query=body.query,
            chunks=[],
            context="",
            total_retrieved=0,
        )

    return RetrieveResponse(
        query=result.query,
        chunks=[
            ChunkResponse(
                document_id=c.document_id,
                filename=c.filename,
                page=c.page,
                chunk_index=c.chunk_index,
                similarity=c.similarity,
                text=c.text,
            )
            for c in result.chunks
        ],
        context=result.context,
        total_retrieved=result.total_retrieved,
    )
