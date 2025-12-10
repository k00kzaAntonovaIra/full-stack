from sqlalchemy.orm import Session
from ..crud import (
    trip_members as crud_trip_members,
    users as crud_users,
    trips as crud_trips,
)
from ..schemas.trip_members import (
    TripMemberCreate,
    TripMemberUpdate,
    TripInvite,
    TripJoinRequest,
)


def invite_user_to_trip(db: Session, invite_data: TripInvite, inviter_id: int):
    """Invite user to trip"""
    # Check if trip exists
    trip = crud_trips.get_trip(db, invite_data.trip_id)
    if not trip:
        raise ValueError("Trip not found")

    # Check if inviter has permission
    if not crud_trip_members.is_trip_organizer(db, invite_data.trip_id, inviter_id):
        raise ValueError("Permission denied")

    # Check if user exists
    user = crud_users.get_user(db, invite_data.user_id)
    if not user:
        raise ValueError("User not found")

    # Check if user is already a member
    if crud_trip_members.is_trip_member(db, invite_data.trip_id, invite_data.user_id):
        raise ValueError("User is already a member of this trip")

    # Create invitation
    trip_member_data = TripMemberCreate(
        user_id=invite_data.user_id,
        trip_id=invite_data.trip_id,
        role="member",
    )

    return crud_trip_members.create_trip_member(db, trip_member_data)


def join_trip_request(db: Session, join_data: TripJoinRequest, user_id: int):
    """Request to join a trip"""
    # Check if trip exists
    trip = crud_trips.get_trip(db, join_data.trip_id)
    if not trip:
        raise ValueError("Trip not found")

    # Check if user is already a member
    if crud_trip_members.is_trip_member(db, join_data.trip_id, user_id):
        raise ValueError("You are already a member of this trip")

    # Create join request
    trip_member_data = TripMemberCreate(
        user_id=user_id, trip_id=join_data.trip_id, role="member"
    )

    return crud_trip_members.create_trip_member(db, trip_member_data)


def update_member_role(
    db: Session, trip_id: int, member_id: int, new_role: str, organizer_id: int
):
    """Update member role (organizer only)"""
    # Check if organizer has permission
    if not crud_trip_members.is_trip_organizer(db, trip_id, organizer_id):
        raise ValueError("Permission denied")

    # Check if member exists
    member = crud_trip_members.get_trip_member(db, trip_id, member_id)
    if not member:
        raise ValueError("Member not found")

    # Prevent changing organizer role
    if member.role == "organizer":
        raise ValueError("Cannot change organizer role")

    if new_role not in ["organizer", "member", "viewer"]:
        raise ValueError("Invalid role. Must be 'organizer', 'member', or 'viewer'")

    update_data = TripMemberUpdate(role=new_role)
    return crud_trip_members.update_trip_member(db, trip_id, member_id, update_data)


def remove_member(
    db: Session, trip_id: int, member_id: int, organizer_id: int
):
    """Remove member from trip (organizer only)"""
    # Check if organizer has permission
    if not crud_trip_members.is_trip_organizer(db, trip_id, organizer_id):
        raise ValueError("Permission denied")

    # Check if member exists
    member = crud_trip_members.get_trip_member(db, trip_id, member_id)
    if not member:
        raise ValueError("Member not found")

    # Prevent removing organizer
    if member.role == "organizer":
        raise ValueError("Cannot remove trip organizer")

    return crud_trip_members.delete_trip_member(db, trip_id, member_id)


def leave_trip(db: Session, trip_id: int, user_id: int):
    """Leave trip"""
    trip_member = crud_trip_members.get_trip_member(db, trip_id, user_id)
    if not trip_member:
        raise ValueError("You are not a member of this trip")

    # Prevent organizer from leaving
    if trip_member.role == "organizer":
        raise ValueError("Trip organizer cannot leave the trip")

    return crud_trip_members.delete_trip_member(db, trip_id, user_id)


def get_trip_members(db: Session, trip_id: int, user_id: int):
    """Get trip members with access control"""
    # Check if user has access to the trip
    trip = crud_trips.get_trip(db, trip_id)
    if not trip:
        raise ValueError("Trip not found")

    if not crud_trip_members.is_trip_member(db, trip_id, user_id):
        raise ValueError("Access denied")

    return crud_trip_members.get_trip_members(db, trip_id)
