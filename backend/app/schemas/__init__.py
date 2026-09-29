from app.schemas.city import CityBase, CityCreate, CityResponse, BoundingBoxSchema
from app.schemas.location import LocationBase, LocationCreate, LocationResponse
from app.schemas.sensor import SensorBase, SensorCreate, SensorResponse
from app.schemas.measurement import MeasurementBase, MeasurementCreate, MeasurementResponse
from app.schemas.fire import FireDetectionBase, FireDetectionCreate, FireDetectionResponse
from app.schemas.weather import WeatherObservationBase, WeatherObservationCreate, WeatherObservationResponse
from app.schemas.hotspot import HotspotBase, HotspotCreate, HotspotResponse

from app.schemas.environment import (
    LatestMeasurementItem,
    StationSensorItem,
    AQStationWithLatestResponse,
    OpenAQSyncSummary,
    FirmsSyncSummary,
    WeatherSyncSummary,
    GwaliorSyncResponse,
)

__all__ = [
    "CityBase",
    "CityCreate",
    "CityResponse",
    "BoundingBoxSchema",
    "LocationBase",
    "LocationCreate",
    "LocationResponse",
    "SensorBase",
    "SensorCreate",
    "SensorResponse",
    "MeasurementBase",
    "MeasurementCreate",
    "MeasurementResponse",
    "FireDetectionBase",
    "FireDetectionCreate",
    "FireDetectionResponse",
    "WeatherObservationBase",
    "WeatherObservationCreate",
    "WeatherObservationResponse",
    "HotspotBase",
    "HotspotCreate",
    "HotspotResponse",
    "LatestMeasurementItem",
    "StationSensorItem",
    "AQStationWithLatestResponse",
    "OpenAQSyncSummary",
    "FirmsSyncSummary",
    "WeatherSyncSummary",
    "GwaliorSyncResponse",
]
