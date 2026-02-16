from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..core.security import get_current_user
from ..schemas.users import UserRead, UserUpdate
from ..service import users as user_service
from ..models.users import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """🔍 Получить свой профиль"""
    return user_service.get_user_profile(db, current_user.id)


@router.put("/me", response_model=UserRead)
async def update_my_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """✏️ Обновить свой профиль"""
    try:
        user = user_service.update_user_profile(db, current_user.id, user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """❌ Удалить свой аккаунт"""
    user_service.delete_user(db, current_user.id)
    return None
