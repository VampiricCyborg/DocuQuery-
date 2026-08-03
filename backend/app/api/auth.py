from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.dependencies import get_current_user, get_db
from app.core.config import get_settings
from app.core.security import create_session, hash_password, verify_password
from app.database.models import User
from app.schemas.auth import Credentials, SignupRequest, UserOut

router = APIRouter()


def _set_session(response: Response, user_id: str) -> None:
    settings = get_settings()
    response.set_cookie(
        settings.auth_cookie_name,
        create_session(user_id),
        max_age=settings.auth_session_days * 86400,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite="none" if settings.auth_cookie_secure else "lax",
        path="/",
    )


@router.post("/auth/signup", response_model=UserOut, status_code=201)
async def signup(payload: SignupRequest, response: Response, db=Depends(get_db)):
    user = User(name=payload.name.strip(), email=payload.email.strip().lower(), password_hash=hash_password(payload.password))
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="An account already exists for this email.")
    _set_session(response, user.id)
    return UserOut.from_user(user)


@router.post("/auth/login", response_model=UserOut)
async def login(payload: Credentials, response: Response, db=Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email.strip().lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    _set_session(response, user.id)
    return UserOut.from_user(user)


@router.get("/auth/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return UserOut.from_user(user)


@router.post("/auth/logout", status_code=204)
async def logout(response: Response):
    response.delete_cookie(get_settings().auth_cookie_name, path="/")
