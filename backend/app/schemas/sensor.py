from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class SensorBase(BaseModel):
    external_sensor_id: str = Field(..., max_length=100)
    monitoring_location_id: int
    provider: str = Field(..., max_length=100)
    parameter: str = Field(..., max_length=50)
    unit: str = Field(..., max_length=30)
    sensor_name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    is_active: bool = True


class SensorCreate(SensorBase):
    pass


class SensorResponse(SensorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
