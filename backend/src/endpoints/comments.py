from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..core.security import get_current_user
from ..schemas.comments import CommentCreate, CommentRead, CommentUpdate
from ..service import comments as comment_service
from ..models.users import User

router = APIRouter(prefix="/trips", tags=["comments"])


@router.post("/{trip_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def add_comment(
    trip_id: int, 
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """➕ Добавить комментарий"""
    try:
        comment = comment_service.create_comment(db, comment_data, current_user.id)
        return comment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{trip_id}/comments", response_model=list[CommentRead])
async def get_trip_comments(
    trip_id: int, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """📋 Список комментариев"""
    try:
        comments = comment_service.get_trip_comments(db, trip_id, current_user.id, skip, limit)
        return comments
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """❌ Удалить комментарий"""
    try:
        comment_service.delete_comment(db, comment_id, current_user.id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
