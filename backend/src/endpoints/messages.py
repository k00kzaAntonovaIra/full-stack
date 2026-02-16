from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..core.security import get_current_user
from ..schemas.messages import MessageCreate, MessageRead, MessageUpdate
from ..service import messages as message_service
from ..models.users import User

router = APIRouter(prefix="/trips", tags=["messages"])


@router.post("/{trip_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
async def send_message(
    trip_id: int, 
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """💬 Отправить сообщение"""
    try:
        message = message_service.send_message(db, message_data, current_user.id)
        return message
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{trip_id}/messages", response_model=list[MessageRead])
async def get_trip_messages(
    trip_id: int, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """📜 Получить все сообщения"""
    try:
        messages = message_service.get_trip_messages(db, trip_id, current_user.id, skip, limit)
        return messages
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
