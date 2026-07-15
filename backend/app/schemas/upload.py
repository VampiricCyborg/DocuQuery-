from pydantic import BaseModel
from app.database.models import ProcessingStatus


class UploadResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    original_filename: str
    file_type: str
    file_size: int
    status: ProcessingStatus
