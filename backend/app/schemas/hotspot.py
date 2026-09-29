from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class HotspotBase(BaseModel):
    city_id: int
    latitude: float
    longitude: float
    radius: float = Field(default=3500.0)
    hotspot_type: str = Field(default="thermal_anomaly_cluster", max_length=100)
    source_signal_count: int = Field(default=0)
    confidence: Optional[str] = Field(None, max_length=30)
    derived_at: datetime
    metadata: Optional[Dict[str, Any]] = None


class HotspotCreate(HotspotBase):
    pass


class HotspotResponse(HotspotBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
