from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..core.security import get_current_user
from ..schemas.trips import TripCreate, TripRead, TripUpdate
from ..service import trips as trip_service
from ..models.users import User

router = APIRouter(prefix="/trips", tags=["trips"])


@router.post("/", response_model=TripRead, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_data: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """➕ Создать поездку"""
    try:
        trip = trip_service.create_trip(db, trip_data, current_user.id)
        return trip
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[TripRead])
async def get_all_trips(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """📃 Список всех поездок"""
    try:
        trips = trip_service.get_user_trips(db, current_user.id, skip, limit)
        return trips
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{trip_id}", response_model=TripRead)
async def get_trip_details(
    trip_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """🔍 Получить детали поездки"""
    try:
        trip = trip_service.get_trip_details(db, trip_id, current_user.id)
        return trip
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{trip_id}", response_model=TripRead)
async def update_trip(
    trip_id: int, 
    trip_data: TripUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """✏️ Обновить поездку"""
    try:
        trip = trip_service.update_trip(db, trip_id, trip_data, current_user.id)
        return trip
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """❌ Удалить поездку"""
    try:
        trip_service.delete_trip(db, trip_id, current_user.id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
