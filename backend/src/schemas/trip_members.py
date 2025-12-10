from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TripMemberBase(BaseModel):
    role: str = "member"  # organizer, member, viewer


class TripMemberCreate(TripMemberBase):
    user_id: int
    trip_id: int


class TripMemberUpdate(BaseModel):
    role: Optional[str] = None


class TripMemberRead(TripMemberBase):
    id: int
    user_id: int
    trip_id: int
    joined_at: datetime

    class Config:
        from_attributes = True


class TripMemberDetail(TripMemberRead):
    """Extended trip member information with user details"""
    user: Optional[dict] = None


class TripInvite(BaseModel):
    user_id: int
    trip_id: int
    message: Optional[str] = None


class TripJoinRequest(BaseModel):
    trip_id: int
    message: Optional[str] = None
