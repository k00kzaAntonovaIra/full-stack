from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..schemas.trip_members import TripMemberRead, TripJoinRequest
from ..service import trip_members as trip_member_service

router = APIRouter(prefix="/trips", tags=["trip-members"])


@router.post("/{trip_id}/join", response_model=TripMemberRead, status_code=status.HTTP_201_CREATED)
async def join_trip(
    trip_id: int, 
    join_data: TripJoinRequest,
    user_id: int,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """🔗 Присоединиться к поездке"""
    try:
        trip_member = trip_member_service.join_trip_request(db, join_data, user_id)
        return trip_member
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{trip_id}/members", response_model=list[TripMemberRead])
async def get_trip_members(
    trip_id: int, 
    user_id: int,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """👥 Получить участников"""
    try:
        members = trip_member_service.get_trip_members(db, trip_id, user_id)
        return members
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{trip_id}/members/{member_id}", response_model=TripMemberRead)
async def update_member_role(
    trip_id: int, 
    member_id: int, 
    new_role: str,
    organizer_id: int,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """🔁 Изменить роль"""
    try:
        trip_member = trip_member_service.update_member_role(
            db, trip_id, member_id, new_role, organizer_id
        )
        return trip_member
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{trip_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_trip_member(
    trip_id: int, 
    member_id: int,
    user_id: int,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """➖ Выйти / удалить участника"""
    try:
        if member_id == user_id:
            # Пользователь покидает поездку
            trip_member_service.leave_trip(db, trip_id, user_id)
        else:
            # Организатор удаляет участника
            trip_member_service.remove_member(db, trip_id, member_id, user_id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
