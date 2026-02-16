from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from .settings import settings
from .db import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def _build_token(user_id: int, token_type: str, expires_delta: timedelta) -> tuple[str, datetime]:
    """Create signed JWT with standard claims"""
    now = datetime.now(timezone.utc)
    expire = now + expires_delta
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "exp": expire,
    }
    if token_type == "refresh":
        payload["jti"] = uuid.uuid4().hex
    encoded_jwt = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt, expire


def create_access_token(user_id: int, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    lifetime = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token, _ = _build_token(user_id, "access", lifetime)
    return token


def create_refresh_token(user_id: int, expires_delta: Optional[timedelta] = None) -> tuple[str, datetime]:
    """Create JWT refresh token with longer lifetime"""
    lifetime = expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return _build_token(user_id, "refresh", lifetime)


def decode_token(token: str, expected_type: Optional[str] = None) -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc

    if expected_type and payload.get("type") != expected_type:
        raise ValueError("Invalid token type")

    if payload.get("sub") is None:
        raise ValueError("Token payload missing subject")

    return payload


def verify_token(token: str, expected_type: Optional[str] = None) -> Optional[dict]:
    """Backward-compatible wrapper: returns payload or None"""
    try:
        return decode_token(token, expected_type)
    except ValueError:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    """Get current authenticated user from Bearer token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise credentials_exception

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except ValueError:
        raise credentials_exception

    user_id: str = payload.get("sub")
    from ..crud import users as crud_users  # Local import to avoid circular dependency
    user = crud_users.get_user(db, user_id=int(user_id))
    if user is None:
        raise credentials_exception

    return user
