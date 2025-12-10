from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.db import Base


class TripMember(Base):
    __tablename__ = "trip_members"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, default="member")  # organizer, member, viewer
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="trip_memberships")
    trip = relationship("Trip", back_populates="members")
    
    # Ensure unique user-trip combination
    __table_args__ = (UniqueConstraint('user_id', 'trip_id', name='unique_user_trip'),)
