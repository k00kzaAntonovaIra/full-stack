from sqlalchemy.orm import Session
from ..crud import comments as crud_comments, trip_members as crud_trip_members
from ..schemas.comments import CommentCreate, CommentUpdate


def create_comment(db: Session, comment_data: CommentCreate, user_id: int):
    """Create new comment"""
    # Check if user is a member of the trip
    if not crud_trip_members.is_trip_member(db, comment_data.trip_id, user_id):
        raise ValueError("You are not a member of this trip")

    return crud_comments.create_comment(db, comment_data, user_id)


def get_trip_comments(
    db: Session, trip_id: int, user_id: int, skip: int = 0, limit: int = 100
):
    """Get comments for a specific trip"""
    # Check if user is a member of the trip
    if not crud_trip_members.is_trip_member(db, trip_id, user_id):
        raise ValueError("You are not a member of this trip")

    return crud_comments.get_trip_comments(db, trip_id, skip, limit)


def get_user_comments(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
):
    """Get comments created by a specific user"""
    return crud_comments.get_user_comments(db, user_id, skip, limit)


def update_comment(
    db: Session, comment_id: int, comment_data: CommentUpdate, user_id: int
):
    """Update comment"""
    # Check if user can edit the comment
    if not crud_comments.can_user_edit_comment(db, comment_id, user_id):
        raise ValueError("You can only edit your own comments")

    return crud_comments.update_comment(db, comment_id, comment_data)


def delete_comment(db: Session, comment_id: int, user_id: int):
    """Delete comment"""
    # Check if user can delete the comment
    if not crud_comments.can_user_edit_comment(db, comment_id, user_id):
        raise ValueError("You can only delete your own comments")

    return crud_comments.delete_comment(db, comment_id)
