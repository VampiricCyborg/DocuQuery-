import logging

from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas import DocumentOut
from app.services.document_service import save_document
from app.ingestion.pipeline import run_ingestion_pipeline
from app.database.session import AsyncSessionLocal
from app.core.middleware import limiter
from app.core.config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)


async def _run_pipeline_with_own_session(document_id: str, storage_path: str, filename: str) -> None:
    """Background task gets its own DB session (request session will be closed by then)."""
    async with AsyncSessionLocal() as db:
        await run_ingestion_pipeline(document_id, storage_path, filename, db)


@router.post("/upload", response_model=DocumentOut, status_code=201)
@limiter.limit(lambda: get_settings().rate_limit_upload)
async def upload_file(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document — returns immediately; ingestion runs in background."""
    doc = await save_document(file, db)
    background_tasks.add_task(
        _run_pipeline_with_own_session,
        doc.id,
        doc.storage_path,
        doc.original_filename,
    )
    logger.info("Queued ingestion pipeline for document %s", doc.id)
    return doc
