from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str | None = None
    email: str
    bio: str | None = None
    avatar_url: str | None = None


class UserCreate(BaseModel):
    email: str
    password: str



class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str
    password: str


class UserProfile(UserRead):
    """Extended user profile with additional information"""
    pass

class UserProfileUpdate(BaseModel):
    name: str
    bio: str | None = None
    avatar_url: str | None = None


class UserSearch(BaseModel):
    query: str
    skip: int = 0
    limit: int = 100
