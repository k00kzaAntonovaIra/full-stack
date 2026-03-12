from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..schemas.trips import TripCreate, TripRead, TripUpdate
from ..service import trips as trip_service
from fastapi import Depends
from ..core.security import get_current_user
from ..models.users import User

router = APIRouter(prefix="/trips", tags=["trips"])


@router.post("/", response_model=TripRead)
async def create_trip(
    trip_data: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = trip_service.create_trip(db, trip_data, current_user.id)
    return trip


@router.get("/", response_model=list[TripRead])
async def get_all_trips(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    trips = trip_service.get_all_trips(db, skip, limit)
    return trips

@router.get("/{trip_id}", response_model=TripRead)
async def get_trip_details(
    trip_id: int, 
    user_id: int,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """ Получить детали поездки"""
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
    """ Обновить поездку"""
    try:
        trip = trip_service.update_trip(db, trip_id, trip_data, user_id)
        return trip
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        trip_service.delete_trip(
            db=db,
            trip_id=trip_id,
            current_user=current_user
        )
        return None
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
