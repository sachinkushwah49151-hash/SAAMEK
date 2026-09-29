from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class FireDetectionBase(BaseModel):
    external_detection_id: str = Field(..., max_length=150)
    latitude: float
    longitude: float
    detected_at: datetime
    satellite: str = Field(..., max_length=100)
    instrument: str = Field(default="VIIRS", max_length=50)
    confidence: Optional[str] = Field(None, max_length=30)
    frp: Optional[float] = None
    source: str = Field(default="NASA FIRMS", max_length=100)
    raw_data: Optional[Dict[str, Any]] = None


class FireDetectionCreate(FireDetectionBase):
    pass


class FireDetectionResponse(FireDetectionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
