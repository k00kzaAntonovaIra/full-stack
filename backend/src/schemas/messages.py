from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    trip_id: int


class MessageUpdate(BaseModel):
    content: Optional[str] = None


class MessageRead(MessageBase):
    id: int
    user_id: int
    trip_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MessageDetail(MessageRead):
    """Extended message information with user details"""
    user: Optional[dict] = None


class MessageSearch(BaseModel):
    trip_id: int
    query: Optional[str] = None
    skip: int = 0
    limit: int = 100
