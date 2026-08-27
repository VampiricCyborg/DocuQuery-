import pytest
from types import SimpleNamespace
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch

from app.main import app
from app.api.dependencies import get_db
from app.core.config import Settings
from app.core.security import create_session
from app.database.models import User


@pytest.mark.asyncio
async def test_health_ok():
    mock_db = AsyncMock()
    mock_db.execute = AsyncMock()

    with patch("app.api.health.get_db", return_value=mock_db):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


@pytest.mark.asyncio
async def test_chat_json_body_is_accepted():
    """
    POST /chat without authentication must return 401.

    Root-cause guard: previously the route parameter was named `body: ChatRequest`
    alongside `request: Request`.  FastAPI interpreted `body` as a required QUERY
    parameter instead of the JSON request body, producing:
        {"detail": [{"type": "missing", "loc": ["query", "body"], ...}]}

    The fix renames the parameter to `chat_request: ChatRequest`.
    In the unit-test environment retrieval will fail (no DB → 503).
    404 = route missing; 422 = body still mis-routed — both are hard failures.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/chat",
            json={"message": "hello"},
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_chat_succeeds_with_valid_session_cookie(monkeypatch):
    """A valid session cookie permits an authenticated chat request."""
    user = User(
        id="test-user",
        name="Test User",
        email="test@example.com",
        password_hash="unused",
    )
    mock_db = AsyncMock()
    mock_db.scalar = AsyncMock(return_value=user)

    async def override_db():
        yield mock_db

    class FakeGenerator:
        async def generate(self, message, retrieval_result, mode):
            return SimpleNamespace(answer="ok", citations=[], model="test-model")

    monkeypatch.setattr("app.api.chat.get_response_generator", lambda: FakeGenerator())
    monkeypatch.setattr(
        "app.api.chat.get_settings",
        lambda: Settings(llm_streaming_enabled=False),
    )
    app.dependency_overrides[get_db] = override_db

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/chat",
                json={"message": "hello", "mode": "llm"},
                cookies={"docuquery_session": create_session(user.id)},
            )
    finally:
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    assert response.json()["answer"] == "ok"


@pytest.mark.asyncio
async def test_chat_missing_message_requires_authentication():
    """
    Authentication is required before request-body processing is reached.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/chat",
            json={},
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_chat_empty_message_requires_authentication():
    """Authentication is required before message validation."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/chat",
            json={"message": ""},
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_chat_with_optional_fields_accepted():
    """POST /chat with top_k and conversation_id optional fields must not 422."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/chat",
            json={"message": "hello", "top_k": 3, "conversation_id": "conv-abc"},
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code not in (422, 404), (
        f"POST /chat with optional fields returned {response.status_code}.\n"
        f"Response: {response.text}"
    )


@pytest.mark.asyncio
async def test_chat_returns_valid_response():
    """Legacy smoke test — kept for backwards compatibility."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/chat", json={"message": "hello"})

    assert response.status_code == 401


def test_allowed_origins_parses_railway_value():
    settings = Settings(allowed_origins="https://docuqueryvc.vercel.app")

    assert settings.allowed_origins_list == ["https://docuqueryvc.vercel.app"]


def test_allowed_origins_strips_trailing_slash_and_quotes():
    settings = Settings(allowed_origins='"https://docuqueryvc.vercel.app/"')

    assert settings.allowed_origins_list == ["https://docuqueryvc.vercel.app"]


@pytest.mark.asyncio
async def test_upload_options_preflight_includes_cors_headers(monkeypatch):
    from app import main as app_main

    monkeypatch.setattr(
        app_main,
        "settings",
        Settings(allowed_origins="https://docuqueryvc.vercel.app"),
    )
    test_app = app_main.create_app()

    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        response = await client.options(
            "/upload",
            headers={
                "Origin": "https://docuqueryvc.vercel.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://docuqueryvc.vercel.app"
    assert response.headers["access-control-allow-credentials"] == "true"
