from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.db import engine, Base
from src.core.settings import settings
from src.endpoints import users, auth, trips, trip_members, messages, comments
from src.models import User, Trip, TripMember, Message, Comment, RefreshToken

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Travel App API",
    description="API for managing travel trips and group communication",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# Include routers
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(trip_members.router)
app.include_router(messages.router)
app.include_router(comments.router)


@app.get("/")
async def root():
    return {"message": "Travel App API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}