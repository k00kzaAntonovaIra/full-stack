from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
import shutil
import os
from datetime import date
from ..schemas.trips import TripReadWithWeather
from ..service.weather import get_weather_by_city
from ..service.s3 import s3_service

from ..core.db import get_db
from ..core.security import get_current_user
from ..models.users import User
from ..models.trips import Trip
from ..schemas.trips import TripCreate, TripRead, TripUpdate
from ..service import trips as trip_service

router = APIRouter(prefix="/trips", tags=["trips"])


MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 МБ
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"]

@router.post("/{trip_id}/upload-image")
async def upload_trip_image(
    trip_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Проверка формата (оставляем как было)
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Недопустимый формат. Разрешены: {', '.join(ALLOWED_TYPES)}"
        )

    # 2. Проверка размера файла 
    # читаем файл один раз, и эти байты (content) потом отправим в S3
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Файл слишком большой. Максимум 5МБ")

    # 3. Проверка прав доступа (оставляем как было)
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Поездка не найдена")
    
    if trip.creator_id != current_user.id and current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="У вас нет прав для изменения этой поездки")

    # 4. Загрузка в S3 (MinIO) вместо локального диска
    try:
        file_extension = os.path.splitext(file.filename)[1]
        file_name = f"trip_{trip_id}{file_extension}"

        # Вызываем асинхронный сервис
        image_url = await s3_service.upload_file(
            file_content=content,
            file_name=file_name,
            content_type=file.content_type
        )

        # 5. Обновление БД
        # Теперь тут будет ссылка вида http://localhost:9000/trips/trip_1.png
        trip.image_url = image_url
        db.commit() 
        db.refresh(trip)

        return {"image_url": image_url, "status": "Uploaded to S3"}

    except Exception as e:
        # Если что-то пошло не так с Docker или MinIO
        print(f"DEBUG ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при загрузке в облако: {str(e)}")

@router.post("/", response_model=TripRead)
async def create_trip(
    trip_data: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = trip_service.create_trip(db, trip_data, current_user.id)
    return trip

@router.get("/", response_model=List[TripReadWithWeather]) 
async def get_all_trips(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db)
):
    
    trips = trip_service.get_all_trips(
        db, 
        skip=skip, 
        limit=limit, 
        search=search, 
        min_budget=min_budget, 
        max_budget=max_budget,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    results = []
    for trip in trips:
        weather_data = await get_weather_by_city(trip.destination)
        
        trip_dict = {
            "id": trip.id,
            "title": trip.title,
            "description": trip.description,
            "destination": trip.destination,
            "start_date": trip.start_date,
            "end_date": trip.end_date,
            "budget_total": trip.budget_total,
            "image_url": trip.image_url,
            "created_at": trip.created_at,
            "creator_id": trip.creator_id,
            "weather": weather_data \
        }
        results.append(trip_dict)
        
    return results

@router.get("/{trip_id}", response_model=TripReadWithWeather)
async def get_trip_details(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        trip = trip_service.get_trip_details(db, trip_id, current_user.id)
        
        weather_data = await get_weather_by_city(trip.destination)
        
        return {
            "id": trip.id,
            "title": trip.title,
            "description": trip.description,
            "destination": trip.destination,
            "start_date": trip.start_date,
            "end_date": trip.end_date,
            "budget_total": trip.budget_total,
            "image_url": trip.image_url,
            "created_at": trip.created_at,
            "creator_id": trip.creator_id,
            "weather": weather_data
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@router.put("/{trip_id}", response_model=TripRead)
async def update_trip(
    trip_id: int,
    trip_data: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        trip = trip_service.update_trip(db, trip_id, trip_data, current_user.id)
        return trip
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        trip_service.delete_trip(
            db=db,
            trip_id=trip_id,
            current_user=current_user
        )
        return None
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))