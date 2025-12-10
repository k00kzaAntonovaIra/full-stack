from sqlalchemy.orm import Session
from ..crud import users as crud_users
from ..schemas.users import UserCreate, UserUpdate, UserLogin
from ..core.security import verify_password, create_access_token
from datetime import timedelta
from ..core.settings import settings


def create_user(db: Session, user_data: UserCreate):
    """Create new user with validation"""
    # Check if user already exists
    existing_user = crud_users.get_user_by_email(db, user_data.email)
    if existing_user:
        raise ValueError("User with this email already exists")

    return crud_users.create_user(db, user_data)


def authenticate_user(db: Session, login_data: UserLogin):
    """Authenticate user and return access token"""
    user = crud_users.get_user_by_email(db, login_data.email)
    if not user:
        raise ValueError("Invalid email or password")

    if not verify_password(login_data.password, user.password_hash):
        raise ValueError("Invalid email or password")

    # Create access token
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


def get_user_profile(db: Session, user_id: int):
    """Get user profile by ID"""
    user = crud_users.get_user(db, user_id)
    if not user:
        raise ValueError("User not found")
    return user


def update_user_profile(db: Session, user_id: int, user_data: UserUpdate):
    """Update user profile"""
    user = crud_users.get_user(db, user_id)
    if not user:
        raise ValueError("User not found")

    # Check if email is being changed and if it's already taken
    if user_data.email and user_data.email != user.email:
        existing_user = crud_users.get_user_by_email(db, user_data.email)
        if existing_user:
            raise ValueError("Email already taken")

    return crud_users.update_user(db, user_id, user_data)


def search_users(
    db: Session, query: str, skip: int = 0, limit: int = 100
):
    """Search users by name or email"""
    return crud_users.search_users(db, query, skip, limit)


def delete_user(db: Session, user_id: int):
    """Delete user"""
    user = crud_users.get_user(db, user_id)
    if not user:
        raise ValueError("User not found")
    return crud_users.delete_user(db, user_id)
