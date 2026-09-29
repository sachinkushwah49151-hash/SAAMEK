from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class LocationBase(BaseModel):
    external_location_id: str = Field(..., max_length=100)
    name: str = Field(..., max_length=255)
    provider: str = Field(..., max_length=100)
    latitude: float
    longitude: float
    city_id: int
    country: str = "India"
    state: Optional[str] = None
    is_active: bool = True
    metadata: Optional[Dict[str, Any]] = None
    last_seen_at: Optional[datetime] = None


class LocationCreate(LocationBase):
    pass


class LocationResponse(LocationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
