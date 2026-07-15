from fastapi import APIRouter

router = APIRouter()


@router.get("/auth/me")
async def me():
    """Auth stub — JWT implementation in Phase 4."""
    return {"message": "Auth not yet implemented."}
