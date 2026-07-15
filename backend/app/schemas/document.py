from datetime import datetime
from pydantic import BaseModel
from app.database.models import ProcessingStatus


class DocumentOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    upload_time: datetime
    storage_path: str
    status: ProcessingStatus
    total_chunks: int


class DocumentChunkOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    document_id: str
    chunk_index: int
    page_number: int
    text: str
    metadata_: dict
