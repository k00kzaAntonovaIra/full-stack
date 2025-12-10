from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.db import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    trips_created = relationship("Trip", back_populates="creator")
    trip_memberships = relationship("TripMember", back_populates="user")
    messages = relationship("Message", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    refresh_tokens = relationship("RefreshToken", back_populates="user")
