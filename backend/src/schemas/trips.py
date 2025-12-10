from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class TripBase(BaseModel):
    title: str
    description: Optional[str] = None
    destination: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget_total: Optional[Decimal] = None


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget_total: Optional[Decimal] = None


class TripRead(TripBase):
    id: int
    created_at: datetime
    creator_id: int

    class Config:
        from_attributes = True


class TripDetail(TripRead):
    """Extended trip information with relationships"""
    creator: Optional[dict] = None
    members_count: Optional[int] = None


class TripSearch(BaseModel):
    query: str
    skip: int = 0
    limit: int = 100
