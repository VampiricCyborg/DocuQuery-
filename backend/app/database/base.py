from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


def _normalize_async_url(url: str) -> str:
    """Ensure the database URL uses the asyncpg driver required by create_async_engine.

    Railway's Postgres plugin provides DATABASE_URL as 'postgresql://...',
    which SQLAlchemy maps to the synchronous psycopg2 dialect. Rewrite the
    scheme so the async asyncpg driver is used.
    """
    if url.startswith("postgresql+asyncpg://"):
        return url
    if url.startswith("postgresql://"):
        return "postgresql+asyncpg://" + url[len("postgresql://"):]
    if url.startswith("postgres://"):
        return "postgresql+asyncpg://" + url[len("postgres://"):]
    return url


def build_engine() -> AsyncEngine:
    settings = get_settings()
    return create_async_engine(
        _normalize_async_url(settings.database_url),
        echo=settings.debug,
        pool_pre_ping=True,
    )


engine = build_engine()
