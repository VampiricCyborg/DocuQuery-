"""Password hashing and signed HTTP-only session helpers."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time

from app.core.config import get_settings


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"pbkdf2_sha256$310000${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, rounds, salt_text, digest_text = encoded.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(salt_text.encode())
        expected = base64.urlsafe_b64decode(digest_text.encode())
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(rounds))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def create_session(user_id: str) -> str:
    settings = get_settings()
    payload = {"sub": user_id, "exp": int(time.time()) + settings.auth_session_days * 86400}
    body = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = hmac.new(settings.auth_secret.encode(), body.encode(), hashlib.sha256).digest()
    return f"{body}.{base64.urlsafe_b64encode(signature).decode().rstrip('=')}"


def read_session(token: str | None) -> str | None:
    if not token or "." not in token:
        return None
    body, signature = token.split(".", 1)
    settings = get_settings()
    try:
        supplied = base64.urlsafe_b64decode((signature + "===").encode())
        expected = hmac.new(settings.auth_secret.encode(), body.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(supplied, expected):
            return None
        payload = json.loads(base64.urlsafe_b64decode((body + "===").encode()))
        if int(payload["exp"]) < int(time.time()):
            return None
        return str(payload["sub"])
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        return None
