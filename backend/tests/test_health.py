import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch

from app.main import app
from app.core.config import Settings


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
    POST /chat with a valid JSON body must NOT return 422.

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

    assert response.status_code != 422, (
        f"POST /chat returned 422 — JSON body is not being parsed.\n"
        f"Response: {response.text}"
    )
    assert response.status_code != 404, "POST /chat route not found."
    assert response.status_code in (200, 503)


@pytest.mark.asyncio
async def test_chat_missing_message_returns_422():
    """
    POST /chat without the required `message` field must return 422.
    Validates that Pydantic body validation is active.
    Crucially, the error location must be in the body, not in query params.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/chat",
            json={},
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 422
    data = response.json()
    locs = [tuple(err["loc"]) for err in data["detail"]]
    assert any("message" in loc for loc in locs), (
        f"Expected validation error on 'message', got: {locs}"
    )
    assert not any(loc[0] == "query" for loc in locs), (
        f"'message' is being reported as a query param — body parsing is broken. locs: {locs}"
    )


@pytest.mark.asyncio
async def test_chat_empty_message_returns_422():
    """POST /chat with an empty string must return 422 (min_length=1)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/chat",
            json={"message": ""},
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 422


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

    # 503 = retrieval unavailable (no DB in test env)
    assert response.status_code in (200, 503)


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
