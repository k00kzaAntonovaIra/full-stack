from sqlalchemy.orm import Session
from ..crud import messages as crud_messages, trip_members as crud_trip_members
from ..schemas.messages import MessageCreate, MessageUpdate


def send_message(db: Session, message_data: MessageCreate, user_id: int):
    """Send message to trip chat"""
    # Check if user is a member of the trip
    if not crud_trip_members.is_trip_member(db, message_data.trip_id, user_id):
        raise ValueError("You are not a member of this trip")

    return crud_messages.create_message(db, message_data, user_id)


def get_trip_messages(
    db: Session, trip_id: int, user_id: int, skip: int = 0, limit: int = 100
):
    """Get messages from trip chat"""
    # Check if user is a member of the trip
    if not crud_trip_members.is_trip_member(db, trip_id, user_id):
        raise ValueError("You are not a member of this trip")

    return crud_messages.get_trip_messages(db, trip_id, skip, limit)


def update_message(
    db: Session, message_id: int, message_data: MessageUpdate, user_id: int
):
    """Update message"""
    # Check if user can edit the message
    if not crud_messages.can_user_edit_message(db, message_id, user_id):
        raise ValueError("You can only edit your own messages")

    return crud_messages.update_message(db, message_id, message_data)


def delete_message(db: Session, message_id: int, user_id: int):
    """Delete message"""
    # Check if user can delete the message
    if not crud_messages.can_user_edit_message(db, message_id, user_id):
        raise ValueError("You can only delete your own messages")

    return crud_messages.delete_message(db, message_id)


def get_message_history(
    db: Session,
    trip_id: int,
    user_id: int,
    before_message_id: int | None = None,
    limit: int = 50,
):
    """Get message history with pagination"""
    # Check if user is a member of the trip
    if not crud_trip_members.is_trip_member(db, trip_id, user_id):
        raise ValueError("You are not a member of this trip")

    messages = crud_messages.get_trip_messages(db, trip_id, skip=0, limit=limit)

    # If before_message_id is provided, filter messages before that ID
    if before_message_id:
        messages = [msg for msg in messages if msg.id < before_message_id]

    return messages[:limit]


def search_messages(
    db: Session,
    trip_id: int,
    query: str,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
):
    """Search messages in trip chat"""
    # Check if user is a member of the trip
    if not crud_trip_members.is_trip_member(db, trip_id, user_id):
        raise ValueError("You are not a member of this trip")

    # Get all messages and filter by query
    messages = crud_messages.get_trip_messages(db, trip_id, skip=0, limit=1000)
    filtered_messages = [
        msg for msg in messages if query.lower() in msg.content.lower()
    ]

    return filtered_messages[skip : skip + limit]
