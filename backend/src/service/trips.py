from sqlalchemy.orm import Session
from ..crud import trips as crud_trips, trip_members as crud_trip_members
from ..schemas.trips import TripCreate, TripUpdate
from ..schemas.trip_members import TripMemberCreate


def create_trip(db: Session, trip_data: TripCreate, creator_id: int):
    """Create new trip and add creator as organizer"""
    # Create the trip
    trip = crud_trips.create_trip(db, trip_data, creator_id)

    # Add creator as trip member with organizer role
    trip_member_data = TripMemberCreate(
        user_id=creator_id, trip_id=trip.id, role="organizer"
    )
    crud_trip_members.create_trip_member(db, trip_member_data)

    return trip


def get_trip_details(db: Session, trip_id: int, user_id: int):
    """Get trip details with access control"""
    trip = crud_trips.get_trip(db, trip_id)
    if not trip:
        raise ValueError("Trip not found")

    # Check if user has access to the trip (all trips are accessible to members)
    if not crud_trip_members.is_trip_member(db, trip_id, user_id):
        raise ValueError("Access denied")

    return trip


def update_trip(db: Session, trip_id: int, trip_data: TripUpdate, user_id: int):
    """Update trip with permission check"""
    trip = crud_trips.get_trip(db, trip_id)
    if not trip:
        raise ValueError("Trip not found")

    # Check if user is organizer
    if not crud_trip_members.is_trip_organizer(db, trip_id, user_id):
        raise ValueError("Permission denied")

    return crud_trips.update_trip(db, trip_id, trip_data)


def delete_trip(db: Session, trip_id: int, user_id: int):
    """Delete trip with permission check"""
    trip = crud_trips.get_trip(db, trip_id)
    if not trip:
        raise ValueError("Trip not found")

    # Only organizer can delete the trip
    trip_member = crud_trip_members.get_trip_member(db, trip_id, user_id)
    if not trip_member or trip_member.role != "organizer":
        raise ValueError("Only trip organizer can delete the trip")

    return crud_trips.delete_trip(db, trip_id)


def get_user_trips(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
):
    """Get trips where user is a member"""
    return crud_trip_members.get_user_trips(db, user_id, skip, limit)


def search_trips(
    db: Session,
    query: str,
    user_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
):
    """Search trips with access control"""
    trips = crud_trips.search_trips(db, query, skip, limit)

    # Filter based on user access - only show trips where user is a member
    if user_id:
        accessible_trips = []
        for trip in trips:
            if crud_trip_members.is_trip_member(db, trip.id, user_id):
                accessible_trips.append(trip)
        return accessible_trips

    # If no user_id provided, return empty list (no public trips in new schema)
    return []


def get_trip_statistics(db: Session, trip_id: int, user_id: int):
    """Get trip statistics for authorized users"""
    trip = get_trip_details(db, trip_id, user_id)

    # Get member count
    members = crud_trip_members.get_trip_members(db, trip_id)
    member_count = len(members)

    return {
        "trip": trip,
        "member_count": member_count,
    }
