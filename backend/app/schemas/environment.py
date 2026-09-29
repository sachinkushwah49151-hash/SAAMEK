"""Pydantic schemas for Environmental read and ingestion endpoints."""
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.fire import FireDetectionResponse
from app.schemas.weather import WeatherObservationResponse


class LatestMeasurementItem(BaseModel):
    parameter: str
    value: float
    unit: str
    measured_at: datetime
    source: str = "OpenAQ"

    model_config = ConfigDict(from_attributes=True)


class StationSensorItem(BaseModel):
    id: int
    external_sensor_id: str
    parameter: str
    unit: str
    sensor_name: Optional[str] = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class AQStationWithLatestResponse(BaseModel):
    id: int
    external_location_id: str
    name: str
    provider: str
    latitude: float
    longitude: float
    city_id: int
    country: str = "India"
    state: Optional[str] = None
    is_active: bool = True
    last_seen_at: Optional[datetime] = None
    sensors: List[StationSensorItem] = Field(default_factory=list)
    latest_measurements: List[LatestMeasurementItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class IngestionServiceStatus(BaseModel):
    status: str
    message: Optional[str] = None
    error: Optional[str] = None


class OpenAQSyncSummary(IngestionServiceStatus):
    locations_discovered: int = 0
    sensors_discovered: int = 0
    measurements_stored: int = 0


class FirmsSyncSummary(IngestionServiceStatus):
    detections_received: int = 0
    detections_stored: int = 0


class WeatherSyncSummary(IngestionServiceStatus):
    observation_stored: bool = False
    observed_at: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    weather_code: Optional[int] = None


class GwaliorSyncResponse(BaseModel):
    city: str
    openaq: OpenAQSyncSummary
    firms: FirmsSyncSummary
    weather: WeatherSyncSummary
    synced_at: str
