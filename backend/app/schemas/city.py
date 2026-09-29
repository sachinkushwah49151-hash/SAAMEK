from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class BoundingBoxSchema(BaseModel):
    min_lon: float
    min_lat: float
    max_lon: float
    max_lat: float


class CityBase(BaseModel):
    name: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    country: str = Field(default="India", max_length=100)
    latitude: float
    longitude: float
    bounding_box: Dict[str, Any]
    is_active: bool = True


class CityCreate(CityBase):
    pass


class CityResponse(CityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
