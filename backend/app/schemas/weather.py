from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class WeatherObservationBase(BaseModel):
    city_id: int
    latitude: float
    longitude: float
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    weather_code: Optional[int] = None
    observed_at: datetime
    source: str = Field(default="Open-Meteo", max_length=100)
    raw_data: Optional[Dict[str, Any]] = None


class WeatherObservationCreate(WeatherObservationBase):
    pass


class WeatherObservationResponse(WeatherObservationBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
