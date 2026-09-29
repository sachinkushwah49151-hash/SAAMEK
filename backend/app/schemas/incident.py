from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class IncidentEvidenceBase(BaseModel):
    evidence_type: str
    title: str
    description: str
    value_text: Optional[str] = None
    is_supporting: bool = True
    source: str = "OpenAQ"


class IncidentEvidenceCreate(IncidentEvidenceBase):
    pass


class IncidentEvidenceResponse(IncidentEvidenceBase):
    id: int
    incident_id: int
    recorded_at: datetime

    class Config:
        from_attributes = True


class IncidentStatusHistoryResponse(BaseModel):
    id: int
    incident_id: int
    previous_status: Optional[str] = None
    new_status: str
    changed_by: str
    notes: Optional[str] = None
    changed_at: datetime

    class Config:
        from_attributes = True


class IncidentStatusUpdateRequest(BaseModel):
    new_status: str = Field(..., description="detected, verified, investigating, response_initiated, resolved")
    notes: Optional[str] = None
    changed_by: str = Field(default="Government Officer")


class IncidentCreate(BaseModel):
    title: str
    incident_type: str
    severity: str = "medium"
    status: str = "detected"
    confidence: str = "medium"
    origin: str = "environmental_anomaly"
    description: str
    latitude: float
    longitude: float
    location_name: str = "Gwalior, Madhya Pradesh, India"
    affected_area: str = "Gwalior Airshed"
    affected_radius_meters: int = 1500
    assigned_officer: Optional[str] = None
    citizen_report_id: Optional[str] = None
    is_test_data: bool = False
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    wind_cardinal: Optional[str] = None
    potential_impact_area: Optional[str] = None
    pm25_value: Optional[float] = None
    pm10_value: Optional[float] = None
    nearest_station_name: Optional[str] = None
    evidence_items: Optional[List[IncidentEvidenceCreate]] = None


class IncidentResponse(BaseModel):
    id: int
    incident_id: str
    title: str
    incident_type: str
    severity: str
    status: str
    confidence: str
    origin: str
    description: str
    latitude: float
    longitude: float
    location_name: str
    affected_area: str
    affected_radius_meters: int
    assigned_officer: Optional[str] = None
    citizen_report_id: Optional[str] = None
    is_test_data: bool = False
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    wind_cardinal: Optional[str] = None
    potential_impact_area: Optional[str] = None
    pm25_value: Optional[float] = None
    pm10_value: Optional[float] = None
    nearest_station_name: Optional[str] = None
    detected_at: datetime
    created_at: datetime
    updated_at: datetime
    evidence_items: List[IncidentEvidenceResponse] = []
    status_history: List[IncidentStatusHistoryResponse] = []

    class Config:
        from_attributes = True
