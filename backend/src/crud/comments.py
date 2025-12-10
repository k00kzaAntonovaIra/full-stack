from sqlalchemy.orm import Session
from ..models.comments import Comment
from ..schemas.comments import CommentCreate, CommentUpdate


def get_comment(db: Session, comment_id: int):
    """Get comment by ID"""
    return db.query(Comment).filter(Comment.id == comment_id).first()


def get_trip_comments(db: Session, trip_id: int, skip: int = 0, limit: int = 100):
    """Get comments for a specific trip"""
    return db.query(Comment).filter(Comment.trip_id == trip_id).order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()


def get_user_comments(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get comments created by a specific user"""
    return db.query(Comment).filter(Comment.user_id == user_id).order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()


def create_comment(db: Session, comment: CommentCreate, user_id: int):
    """Create new comment"""
    db_comment = Comment(
        content=comment.content,
        user_id=user_id,
        trip_id=comment.trip_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def update_comment(db: Session, comment_id: int, comment_update: CommentUpdate):
    """Update comment"""
    db_comment = get_comment(db, comment_id)
    if db_comment:
        update_data = comment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_comment, field, value)
        db.commit()
        db.refresh(db_comment)
    return db_comment


def delete_comment(db: Session, comment_id: int):
    """Delete comment"""
    db_comment = get_comment(db, comment_id)
    if db_comment:
        db.delete(db_comment)
        db.commit()
    return db_comment


def can_user_edit_comment(db: Session, comment_id: int, user_id: int):
    """Check if user can edit the comment"""
    comment = get_comment(db, comment_id)
    return comment and comment.user_id == user_id
