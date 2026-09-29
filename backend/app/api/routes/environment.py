"""Environmental data read routes for Gwalior pilot city."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.exceptions import CityNotFoundError
from app.db.database import get_db
from app.schemas.environment import AQStationWithLatestResponse
from app.schemas.fire import FireDetectionResponse
from app.schemas.weather import WeatherObservationResponse
from app.services.environment_service import EnvironmentService

router = APIRouter(prefix="/environment", tags=["Environment"])


@router.get(
    "/gwalior/aq-stations",
    response_model=List[AQStationWithLatestResponse],
    summary="Get discovered AQ monitoring stations for Gwalior",
    description="Returns all dynamic monitoring stations discovered in Gwalior with their latest recorded multi-pollutant measurements.",
)
def get_gwalior_stations(db: Session = Depends(get_db)):
    try:
        return EnvironmentService.get_gwalior_aq_stations(db)
    except CityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/gwalior/fires",
    response_model=List[FireDetectionResponse],
    summary="Get satellite fire detections for Gwalior",
    description="Returns verified NASA FIRMS satellite thermal anomaly detections in Gwalior bounding box.",
)
def get_gwalior_fires(db: Session = Depends(get_db)):
    try:
        return EnvironmentService.get_gwalior_fires(db)
    except CityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/gwalior/weather",
    response_model=Optional[WeatherObservationResponse],
    summary="Get latest weather observation for Gwalior",
    description="Returns latest temperature, humidity, pressure, and wind vectors for Gwalior.",
)
def get_gwalior_weather(db: Session = Depends(get_db)):
    try:
        return EnvironmentService.get_gwalior_weather(db)
    except CityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
