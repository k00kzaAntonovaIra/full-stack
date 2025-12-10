from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..schemas.trips import TripCreate, TripRead, TripUpdate
from ..service import trips as trip_service

router = APIRouter(prefix="/trips", tags=["trips"])


@router.post("/", response_model=TripRead, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_data: TripCreate, 
    creator_id: int,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """➕ Создать поездку"""
    try:
        trip = trip_service.create_trip(db, trip_data, creator_id)
        return trip
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[TripRead])
async def get_all_trips(
    skip: int = 0, 
    limit: int = 100, 
    user_id: int | None = None,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """📃 Список всех поездок"""
    try:
        if user_id:
            trips = trip_service.get_user_trips(db, user_id, skip, limit)
        else:
            trips = trip_service.get_user_trips(db, 1, skip, limit)  # Заглушка
        return trips
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{trip_id}", response_model=TripRead)
async def get_trip_details(
    trip_id: int, 
    user_id: int,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """🔍 Получить детали поездки"""
    try:
        trip = trip_service.get_trip_details(db, trip_id, user_id)
        return trip
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{trip_id}", response_model=TripRead)
async def update_trip(
    trip_id: int, 
    trip_data: TripUpdate, 
    user_id: int,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """✏️ Обновить поездку"""
    try:
        trip = trip_service.update_trip(db, trip_id, trip_data, user_id)
        return trip
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int, 
    user_id: int,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """❌ Удалить поездку"""
    try:
        trip_service.delete_trip(db, trip_id, user_id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
