import uuid
import logging
from pathlib import Path

import aiofiles
from fastapi import UploadFile, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.database.models import Document, ProcessingStatus

logger = logging.getLogger(__name__)
settings = get_settings()


async def save_document(file: UploadFile, db: AsyncSession) -> Document:
    """Validate, persist to disk, and record in DB with UPLOADED status."""
    ext = Path(file.filename or "").suffix.lstrip(".").lower()
    if ext not in settings.allowed_ext_set:
        raise HTTPException(status_code=400, detail=f"File type '.{ext}' not allowed.")

    content = await file.read()
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(status_code=413, detail="File exceeds size limit.")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    unique_name = f"{uuid.uuid4()}.{ext}"
    dest = upload_dir / unique_name

    async with aiofiles.open(dest, "wb") as f:
        await f.write(content)

    doc = Document(
        filename=unique_name,
        original_filename=file.filename or unique_name,
        file_type=ext,
        file_size=len(content),
        storage_path=str(dest),
        status=ProcessingStatus.uploaded,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    logger.info("Saved document %s (%d bytes)", doc.id, doc.file_size)
    return doc


async def update_document_status(
    doc_id: str, status: ProcessingStatus, db: AsyncSession, total_chunks: int | None = None
) -> None:
    """Update processing status (and optionally chunk count) for a document."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    doc.status = status
    if total_chunks is not None:
        doc.total_chunks = total_chunks
    await db.commit()


async def list_documents(db: AsyncSession) -> list[Document]:
    result = await db.execute(select(Document).order_by(Document.upload_time.desc()))
    return list(result.scalars().all())


async def delete_document(doc_id: str, db: AsyncSession) -> None:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    path = Path(doc.storage_path)
    if path.exists():
        path.unlink()

    await db.execute(delete(Document).where(Document.id == doc_id))
    await db.commit()
    logger.info("Deleted document %s", doc_id)
