from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from ..crud import users as crud_users
from ..crud import refresh_tokens as crud_refresh_tokens
from ..schemas.users import UserCreate, UserLogin, UserRead
from ..schemas.auth import Token, LoginResponse
from ..core.security import (
    verify_password,
    create_access_token,
    create_refresh_token as generate_refresh_token,
    decode_token,
)
from ..core.settings import settings


def register_user(db: Session, user_data: UserCreate) -> LoginResponse:
    """Register a new user and return tokens"""
    # Check if user already exists
    existing_user = crud_users.get_user_by_email(db, user_data.email)
    if existing_user:
        raise ValueError("User with this email already exists")

    # Create user
    user = crud_users.create_user(db, user_data)

    # Generate tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        user.id, 
        expires_delta=access_token_expires
    )

    refresh_token_str, refresh_token_expires = generate_refresh_token(user.id)
    
    # Save refresh token to database
    crud_refresh_tokens.create_refresh_token(
        db=db,
        token=refresh_token_str,
        user_id=user.id,
        expires_at=refresh_token_expires
    )

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        user=UserRead.model_validate(user)
    )


def authenticate_user(db: Session, login_data: UserLogin) -> LoginResponse:
    """Authenticate user and return tokens using argon2 (no 72-byte limit)"""
    from ..crud import users as crud_users
    from ..crud import refresh_tokens as crud_refresh_tokens
    from ..schemas.users import UserRead
    from ..core.security import verify_password, create_access_token, create_refresh_token as generate_refresh_token
    from ..core.settings import settings
    from datetime import timedelta

    # Получаем пользователя по email
    user = crud_users.get_user_by_email(db, login_data.email)
    if not user:
        raise ValueError("Invalid email or password")

    # Проверяем пароль через argon2
    if not verify_password(login_data.password, user.password_hash):
        raise ValueError("Invalid email or password")

    # Генерация access токена
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user.id, expires_delta=access_token_expires)

    # Генерация refresh токена
    refresh_token_str, refresh_token_expires = generate_refresh_token(user.id)

    # Сохраняем refresh токен в базе
    crud_refresh_tokens.create_refresh_token(
        db=db,
        token=refresh_token_str,
        user_id=user.id,
        expires_at=refresh_token_expires
    )

    # Возвращаем структуру с токенами и данными пользователя
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        user=UserRead.model_validate(user)
    )




def refresh_access_token(db: Session, refresh_token: str) -> Token:
    """Refresh access token using refresh token"""
    try:
        payload = decode_token(refresh_token, expected_type="refresh")
    except ValueError:
        raise ValueError("Invalid or expired refresh token")

    # Get token from database
    db_token = crud_refresh_tokens.get_refresh_token(db, refresh_token)
    if not db_token or db_token.is_revoked:
        raise ValueError("Invalid or expired refresh token")
    if db_token.expires_at < datetime.now(timezone.utc):
        crud_refresh_tokens.revoke_refresh_token(db, refresh_token)
        raise ValueError("Invalid or expired refresh token")

    # Get user
    user_id_from_token = int(payload.get("sub"))
    if db_token.user_id != user_id_from_token:
        raise ValueError("Invalid refresh token")

    user = crud_users.get_user(db, user_id_from_token)
    if not user:
        raise ValueError("User not found")

    # Generate new access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        user.id, 
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,  # Return same refresh token
        token_type="bearer"
    )


def revoke_refresh_token(db: Session, refresh_token: str):
    """Revoke a refresh token"""
    db_token = crud_refresh_tokens.revoke_refresh_token(db, refresh_token)
    if not db_token:
        raise ValueError("Refresh token not found")
    return {"message": "Token revoked successfully"}


def revoke_all_user_tokens(db: Session, user_id: int):
    """Revoke all refresh tokens for a user"""
    crud_refresh_tokens.revoke_all_user_tokens(db, user_id)
    return {"message": "All tokens revoked successfully"}


def logout_user(db: Session, refresh_token: str):
    """Logout user by revoking refresh token"""
    return revoke_refresh_token(db, refresh_token)

