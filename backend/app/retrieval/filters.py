"""
Metadata filter model and SQLAlchemy clause builder.

Filters map onto DocumentChunk ORM columns and the metadata_ JSON column.
Designed to be extended in Phase 6+ (department, workspace, owner, org).
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, model_validator
from sqlalchemy import and_, cast, String
from sqlalchemy.orm import Query

from app.database.models import Document, DocumentChunk, ProcessingStatus
from app.retrieval.exceptions import InvalidFilterError

_ALLOWED_FILTER_KEYS = {
    "document_id", "filename", "file_type", "status",
    "page_number", "uploaded_before", "uploaded_after",
}


class RetrievalFilter(BaseModel):
    """
    Optional filters applied before vector search.
    All fields are optional — omitted fields are ignored.
    """
    document_id: str | None = None
    filename: str | None = None          # exact match on Document.filename
    file_type: str | None = None         # e.g. "pdf", "docx"
    status: ProcessingStatus | None = None
    page_number: int | None = None
    uploaded_before: datetime | None = None
    uploaded_after: datetime | None = None

    @model_validator(mode="before")
    @classmethod
    def reject_unknown_keys(cls, values: Any) -> Any:
        if isinstance(values, dict):
            unknown = set(values) - _ALLOWED_FILTER_KEYS
            if unknown:
                raise InvalidFilterError(f"Unknown filter keys: {unknown}")
        return values


def build_where_clauses(filters: RetrievalFilter | None) -> list:
    """
    Convert a RetrievalFilter into a list of SQLAlchemy WHERE clauses.
    Returns an empty list when filters is None (no filtering).
    """
    if filters is None:
        return []

    clauses = []

    if filters.document_id:
        clauses.append(DocumentChunk.document_id == filters.document_id)

    if filters.filename:
        clauses.append(Document.filename == filters.filename)

    if filters.file_type:
        clauses.append(Document.file_type == filters.file_type.lower())

    if filters.status:
        clauses.append(Document.status == filters.status)

    if filters.page_number is not None:
        clauses.append(DocumentChunk.page_number == filters.page_number)

    if filters.uploaded_after:
        clauses.append(Document.upload_time >= filters.uploaded_after)

    if filters.uploaded_before:
        clauses.append(Document.upload_time <= filters.uploaded_before)

    return clauses
