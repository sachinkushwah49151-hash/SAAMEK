from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.city import CityResponse
from app.services.city_service import city_service

router = APIRouter(prefix="/cities", tags=["Cities"])


@router.get("", response_model=List[CityResponse], status_code=status.HTTP_200_OK)
def get_active_cities(db: Session = Depends(get_db)):
    """Retrieve all active monitoring cities."""
    return city_service.get_active_cities(db)


@router.get("/gwalior", response_model=CityResponse, status_code=status.HTTP_200_OK)
def get_gwalior_city(db: Session = Depends(get_db)):
    """Retrieve primary pilot city configuration (Gwalior, MP)."""
    return city_service.get_gwalior(db)


@router.get("/{name}", response_model=CityResponse, status_code=status.HTTP_200_OK)
def get_city_by_name(name: str, db: Session = Depends(get_db)):
    """Retrieve configuration for a specific city by name."""
    return city_service.get_city_by_name(db, name)
