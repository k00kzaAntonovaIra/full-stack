from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..core.security import get_current_user
from ..schemas.users import UserLogin, UserCreate
from ..schemas.auth import Token, LoginResponse, RefreshTokenRequest
from ..service import auth as auth_service
from ..models.users import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """📝 Регистрация нового пользователя"""
    try:
        result = auth_service.register_user(db, user_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=LoginResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """🔐 Вход в систему (получить токены)"""
    try:
        result = auth_service.authenticate_user(db, login_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: RefreshTokenRequest, 
    db: Session = Depends(get_db)
):
    """🔄 Обновить access токен используя refresh токен"""
    try:
        result = auth_service.refresh_access_token(db, token_data.refresh_token)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """🚪 Выйти из системы (отозвать refresh токен)"""
    try:
        result = auth_service.logout_user(db, token_data.refresh_token)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/revoke-all", status_code=status.HTTP_200_OK)
async def revoke_all_tokens(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """🔒 Отозвать все refresh токены текущего пользователя"""
    try:
        result = auth_service.revoke_all_user_tokens(db, current_user.id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """👤 Получить информацию о текущем пользователе"""
    from ..schemas.users import UserRead
    return UserRead.model_validate(current_user)
