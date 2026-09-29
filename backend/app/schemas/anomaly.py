from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class EnvironmentalAnomalyResponse(BaseModel):
    id: int
    anomaly_id: str
    title: str
    parameter: str
    baseline_value: float
    observed_value: float
    unit: str
    threshold_ratio: float
    station_name: str
    latitude: float
    longitude: float
    location_name: str
    severity: str
    status: str
    is_test_data: bool
    explanation: str
    detected_at: datetime

    class Config:
        from_attributes = True


class AnomalyTestTriggerRequest(BaseModel):
    parameter: str = Field(default="pm25", description="pm25, pm10, temperature_inversion, smoke_plume")
    observed_value: float = Field(default=168.0)
    baseline_value: float = Field(default=45.0)
    station_name: str = Field(default="City Center, Gwalior - MPPCB")
    location_name: str = Field(default="City Center, Gwalior, Madhya Pradesh, India")
