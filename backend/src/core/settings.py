import os
from typing import List, Optional


class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./travel_app.db")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # CORS
    _CORS_ORIGINS_ENV: Optional[str] = os.getenv("CORS_ORIGINS")
    CORS_ORIGINS: List[str] = (
        [
            origin.strip() 
            for origin in _CORS_ORIGINS_ENV.split(",")
        ]
        if _CORS_ORIGINS_ENV
        else [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:8080",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:8080",
        ]
    )
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    CORS_HEADERS: List[str] = ["Authorization", "Content-Type", "Accept", "Origin"]
    
    # Application
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))


settings = Settings()
