from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timezone
from ..models.refresh_tokens import RefreshToken


def create_refresh_token(
    db: Session, 
    token: str, 
    user_id: int, 
    expires_at: datetime
) -> RefreshToken:
    """Create a new refresh token"""
    db_token = RefreshToken(
        token=token,
        user_id=user_id,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def get_refresh_token(db: Session, token: str) -> RefreshToken:
    """Get refresh token by token string"""
    return db.query(RefreshToken).filter(
        RefreshToken.token == token
    ).first()


def get_refresh_token_by_user(db: Session, user_id: int) -> list[RefreshToken]:
    """Get all refresh tokens for a user"""
    return db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id
    ).all()


def revoke_refresh_token(db: Session, token: str) -> RefreshToken:
    """Revoke a refresh token"""
    db_token = get_refresh_token(db, token)
    if db_token:
        db_token.is_revoked = True
        db.commit()
        db.refresh(db_token)
    return db_token


def revoke_all_user_tokens(db: Session, user_id: int):
    """Revoke all refresh tokens for a user"""
    tokens = get_refresh_token_by_user(db, user_id)
    for token in tokens:
        token.is_revoked = True
    db.commit()
    return tokens


def delete_expired_tokens(db: Session):
    """Delete expired and revoked tokens"""
    now = datetime.now(timezone.utc)
    db.query(RefreshToken).filter(
        and_(
            RefreshToken.expires_at < now,
            RefreshToken.is_revoked == True
        )
    ).delete()
    db.commit()


def is_token_valid(db: Session, token: str) -> bool:
    """Check if refresh token is valid (exists, not revoked, not expired)"""
    db_token = get_refresh_token(db, token)
    if not db_token:
        return False
    
    if db_token.is_revoked:
        return False
    
    if db_token.expires_at < datetime.now(timezone.utc):
        return False
    
    return True

