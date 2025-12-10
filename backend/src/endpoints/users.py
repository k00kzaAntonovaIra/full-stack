from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..schemas.users import UserCreate, UserRead, UserUpdate
from ..service import users as user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """👤 Регистрация пользователя"""
    try:
        user = user_service.create_user(db, user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}", response_model=UserRead)
async def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """🔍 Получить профиль"""
    try:
        user = user_service.get_user_profile(db, user_id)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{user_id}", response_model=UserRead)
async def update_user_profile(
    user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)
):
    """✏️ Обновить профиль"""
    try:
        user = user_service.update_user_profile(db, user_id, user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_account(user_id: int, db: Session = Depends(get_db)):
    """❌ Удалить аккаунт"""
    try:
        user_service.delete_user(db, user_id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
