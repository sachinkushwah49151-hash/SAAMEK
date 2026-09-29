from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class MeasurementBase(BaseModel):
    sensor_id: Optional[int] = None
    monitoring_location_id: int
    parameter: str = Field(..., max_length=50)
    value: float
    unit: str = Field(..., max_length=30)
    measured_at: datetime
    source: str = Field(default="OpenAQ", max_length=100)
    raw_data: Optional[Dict[str, Any]] = None


class MeasurementCreate(MeasurementBase):
    pass


class MeasurementResponse(MeasurementBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
