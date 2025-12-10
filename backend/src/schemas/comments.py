from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    trip_id: int


class CommentUpdate(BaseModel):
    content: Optional[str] = None


class CommentRead(CommentBase):
    id: int
    user_id: int
    trip_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CommentDetail(CommentRead):
    """Extended comment information with user details"""
    user: Optional[dict] = None


class CommentSearch(BaseModel):
    trip_id: int
    skip: int = 0
    limit: int = 100
