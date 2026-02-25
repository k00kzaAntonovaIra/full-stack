from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models.users import User
from ..schemas.users import UserCreate, UserUpdate
from ..core.security import get_password_hash


def get_user(db: Session, user_id: int):
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Get list of users with pagination"""
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user: UserCreate):
    """Create new user"""
    hashed_password = get_password_hash(user.password)

    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        name=None,
        bio=None,
        avatar_url=None
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user



def update_user(db: Session, user_id: int, user_update: UserUpdate):
    """Update user information"""
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    """Delete user"""
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user


def search_users(db: Session, query: str, skip: int = 0, limit: int = 100):
    """Search users by name or email"""
    return db.query(User).filter(
        or_(
            User.name.ilike(f"%{query}%"),
            User.email.ilike(f"%{query}%")
        )
    ).offset(skip).limit(limit).all()
