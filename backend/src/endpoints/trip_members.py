from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..core.security import get_current_user
from ..schemas.trip_members import TripMemberRead, TripJoinRequest
from ..service import trip_members as trip_member_service
from ..models.users import User

router = APIRouter(prefix="/trips", tags=["trip-members"])


@router.post("/{trip_id}/join", response_model=TripMemberRead, status_code=status.HTTP_201_CREATED)
async def join_trip(
    trip_id: int, 
    join_data: TripJoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """🔗 Присоединиться к поездке"""
    try:
        trip_member = trip_member_service.join_trip_request(db, join_data, current_user.id)
        return trip_member
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{trip_id}/members", response_model=list[TripMemberRead])
async def get_trip_members(
    trip_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """👥 Получить участников"""
    try:
        members = trip_member_service.get_trip_members(db, trip_id, current_user.id)
        return members
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{trip_id}/members/{member_id}", response_model=TripMemberRead)
async def update_member_role(
    trip_id: int, 
    member_id: int, 
    new_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """🔁 Изменить роль"""
    try:
        trip_member = trip_member_service.update_member_role(
            db, trip_id, member_id, new_role, current_user.id
        )
        return trip_member
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{trip_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_trip_member(
    trip_id: int, 
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """➖ Выйти / удалить участника"""
    try:
        if member_id == current_user.id:
            # Пользователь покидает поездку
            trip_member_service.leave_trip(db, trip_id, current_user.id)
        else:
            # Организатор удаляет участника
            trip_member_service.remove_member(db, trip_id, member_id, current_user.id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
