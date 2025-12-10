from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models.trips import Trip
from ..schemas.trips import TripCreate, TripUpdate


def get_trip(db: Session, trip_id: int):
    """Get trip by ID"""
    return db.query(Trip).filter(Trip.id == trip_id).first()


def get_trips(db: Session, skip: int = 0, limit: int = 100):
    """Get list of trips with pagination"""
    return db.query(Trip).offset(skip).limit(limit).all()


def get_trips_by_creator(db: Session, creator_id: int, skip: int = 0, limit: int = 100):
    """Get trips created by specific user"""
    return db.query(Trip).filter(Trip.creator_id == creator_id).offset(skip).limit(limit).all()


def create_trip(db: Session, trip: TripCreate, creator_id: int):
    """Create new trip"""
    db_trip = Trip(
        title=trip.title,
        description=trip.description,
        destination=trip.destination,
        start_date=trip.start_date,
        end_date=trip.end_date,
        budget_total=trip.budget_total,
        creator_id=creator_id
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


def update_trip(db: Session, trip_id: int, trip_update: TripUpdate):
    """Update trip information"""
    db_trip = get_trip(db, trip_id)
    if db_trip:
        update_data = trip_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_trip, field, value)
        db.commit()
        db.refresh(db_trip)
    return db_trip


def delete_trip(db: Session, trip_id: int):
    """Delete trip"""
    db_trip = get_trip(db, trip_id)
    if db_trip:
        db.delete(db_trip)
        db.commit()
    return db_trip


def search_trips(db: Session, query: str, skip: int = 0, limit: int = 100):
    """Search trips by title or destination"""
    return db.query(Trip).filter(
        or_(
            Trip.title.ilike(f"%{query}%"),
            Trip.destination.ilike(f"%{query}%")
        )
    ).offset(skip).limit(limit).all()
