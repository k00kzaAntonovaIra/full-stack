from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..schemas.messages import MessageCreate, MessageRead, MessageUpdate
from ..service import messages as message_service

router = APIRouter(prefix="/trips", tags=["messages"])


@router.post("/{trip_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
async def send_message(
    trip_id: int, 
    message_data: MessageCreate,
    user_id: int,  # В реальном приложении получать из токена
    db: Session = Depends(get_db)
):
    """💬 Отправить сообщение"""
    try:
        message = message_service.send_message(db, message_data, user_id)
        return message
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{trip_id}/messages", response_model=list[MessageRead])
async def get_trip_messages(
    trip_id: int, 
    user_id: int,  # В реальном приложении получать из токена
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """📜 Получить все сообщения"""
    try:
        messages = message_service.get_trip_messages(db, trip_id, user_id, skip, limit)
        return messages
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
