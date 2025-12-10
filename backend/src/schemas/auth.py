from pydantic import BaseModel
from typing import Optional
from .users import UserRead


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token data schema"""
    user_id: Optional[int] = None


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str


class LoginResponse(BaseModel):
    """Login response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserRead

