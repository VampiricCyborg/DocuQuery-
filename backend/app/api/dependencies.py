from fastapi import Depends, HTTPException, Request
from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import read_session
from app.database.models import User
from app.database.session import get_db


async def get_current_user(request: Request, db=Depends(get_db)) -> User:
    token = request.cookies.get(get_settings().auth_cookie_name)
    user_id = read_session(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=401, detail="Session is no longer valid")
    return user

__all__ = ["get_db", "get_current_user"]
