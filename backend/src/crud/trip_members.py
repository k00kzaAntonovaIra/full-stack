from sqlalchemy.orm import Session
from ..models.trip_members import TripMember
from ..schemas.trip_members import TripMemberCreate, TripMemberUpdate


def get_trip_member(db: Session, trip_id: int, user_id: int):
    """Get trip member by trip and user ID"""
    return db.query(TripMember).filter(
        TripMember.trip_id == trip_id,
        TripMember.user_id == user_id
    ).first()


def get_trip_members(db: Session, trip_id: int, skip: int = 0, limit: int = 100):
    """Get all members of a trip"""
    return db.query(TripMember).filter(TripMember.trip_id == trip_id).offset(skip).limit(limit).all()



def create_trip_member(db: Session, trip_member: TripMemberCreate):
    """Add user to trip"""
    db_trip_member = TripMember(
        user_id=trip_member.user_id,
        trip_id=trip_member.trip_id,
        role=trip_member.role
    )
    db.add(db_trip_member)
    db.commit()
    db.refresh(db_trip_member)
    return db_trip_member


def update_trip_member(db: Session, trip_id: int, user_id: int, trip_member_update: TripMemberUpdate):
    """Update trip member information"""
    db_trip_member = get_trip_member(db, trip_id, user_id)
    if db_trip_member:
        update_data = trip_member_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_trip_member, field, value)
        db.commit()
        db.refresh(db_trip_member)
    return db_trip_member


def delete_trip_member(db: Session, trip_id: int, user_id: int):
    """Remove user from trip"""
    db_trip_member = get_trip_member(db, trip_id, user_id)
    if db_trip_member:
        db.delete(db_trip_member)
        db.commit()
    return db_trip_member


def is_trip_member(db: Session, trip_id: int, user_id: int):
    """Check if user is a member of the trip"""
    return get_trip_member(db, trip_id, user_id) is not None


def is_trip_organizer(db: Session, trip_id: int, user_id: int):
    """Check if user is organizer of the trip"""
    trip_member = get_trip_member(db, trip_id, user_id)
    return trip_member and trip_member.role == "organizer"
