from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.database.base import engine, Base
from app.api import (
    health_router,
    upload_router,
    documents_router,
    chat_router,
    auth_router,
    retrieve_router,
)

settings = get_settings()
configure_logging(debug=settings.debug)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def startup():
        async with engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.run_sync(Base.metadata.create_all)

    app.include_router(health_router, tags=["Health"])
    app.include_router(upload_router, tags=["Upload"])
    app.include_router(documents_router, tags=["Documents"])
    app.include_router(chat_router, tags=["Chat"])
    app.include_router(auth_router, tags=["Auth"])
    app.include_router(retrieve_router, tags=["Retrieval"])

    return app


app = create_app()
