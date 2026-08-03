from datetime import datetime
from pydantic import BaseModel, Field


class Credentials(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=8, max_length=200)


class SignupRequest(Credentials):
    name: str = Field(min_length=1, max_length=120)


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    createdAt: datetime

    @classmethod
    def from_user(cls, user):
        return cls(id=user.id, name=user.name, email=user.email, createdAt=user.created_at)
