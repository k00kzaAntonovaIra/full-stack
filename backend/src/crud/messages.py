from sqlalchemy.orm import Session
from ..models.messages import Message
from ..schemas.messages import MessageCreate, MessageUpdate


def get_message(db: Session, message_id: int):
    """Get message by ID"""
    return db.query(Message).filter(Message.id == message_id).first()


def get_trip_messages(db: Session, trip_id: int, skip: int = 0, limit: int = 100):
    """Get messages for a specific trip"""
    return db.query(Message).filter(Message.trip_id == trip_id).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()


def get_user_messages(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get messages sent by a specific user"""
    return db.query(Message).filter(Message.user_id == user_id).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()


def create_message(db: Session, message: MessageCreate, user_id: int):
    """Create new message"""
    db_message = Message(
        content=message.content,
        user_id=user_id,
        trip_id=message.trip_id
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def update_message(db: Session, message_id: int, message_update: MessageUpdate):
    """Update message"""
    db_message = get_message(db, message_id)
    if db_message:
        update_data = message_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_message, field, value)
        db.commit()
        db.refresh(db_message)
    return db_message


def delete_message(db: Session, message_id: int):
    """Delete message"""
    db_message = get_message(db, message_id)
    if db_message:
        db.delete(db_message)
        db.commit()
    return db_message


def can_user_edit_message(db: Session, message_id: int, user_id: int):
    """Check if user can edit the message"""
    message = get_message(db, message_id)
    return message and message.user_id == user_id
