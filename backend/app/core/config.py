import json
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "DocuQuery"
    app_version: str = "0.1.0"
    debug: bool = False

    # CORS — comma-separated list of allowed origins
    allowed_origins: str = "http://localhost:3000"

    # Rate limiting
    rate_limit_upload: str = "10/minute"
    rate_limit_chat: str = "30/minute"

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/docuquery"

    @property
    def async_database_url(self) -> str:
        """Normalize Railway's postgresql:// to postgresql+asyncpg://."""
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url

    upload_dir: str = "uploads"
    max_file_size_mb: int = 50
    allowed_extensions: str = "pdf,docx,txt,md"

    # Ingestion
    chunk_size: int = 800
    chunk_overlap: int = 120
    embedding_model: str = "BAAI/bge-base-en-v1.5"
    embedding_batch_size: int = 32

    # Retrieval
    retrieval_top_k: int = 5
    retrieval_similarity_threshold: float = 0.30
    retrieval_max_context_chunks: int = 10
    retrieval_vector_distance: str = "cosine"  # reserved for Phase 6

    # LLM
    llm_provider: str = "groq"
    llm_model: str = "llama-3.3-70b-versatile"
    llm_temperature: float = 0.1
    llm_max_tokens: int = 1024
    llm_max_context_tokens: int = 3000
    llm_streaming_enabled: bool = True
    llm_timeout: float = 30.0
    llm_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"

    @property
    def allowed_origins_list(self) -> list[str]:
        raw = self.allowed_origins.strip()
        if not raw:
            return []

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = raw

        if isinstance(parsed, list):
            candidates = parsed
        else:
            candidates = str(parsed).split(",")

        origins: list[str] = []
        for origin in candidates:
            normalized = str(origin).strip().strip('"').strip("'").rstrip("/")
            if normalized:
                origins.append(normalized)
        return origins

    @property
    def allowed_ext_set(self) -> set[str]:
        return {ext.strip().lower() for ext in self.allowed_extensions.split(",")}

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
