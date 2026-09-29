from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CitizenReportCreate(BaseModel):
    report_type: str = Field(..., description="smoke_burning, air_pollution, waste_dumping, water_pollution, other")
    title: str = Field(..., max_length=255)
    description: str = Field(...)
    latitude: float = Field(...)
    longitude: float = Field(...)
    location_name: str = Field(default="Gwalior, Madhya Pradesh, India")
    image_url: Optional[str] = None
    image_data: Optional[str] = Field(None, description="Base64 image data URI")
    citizen_name: Optional[str] = "Citizen Contributor"
    citizen_contact: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CitizenReportVerifyRequest(BaseModel):
    action: str = Field(..., description="verify, reject, convert_to_incident")
    notes: Optional[str] = None
    verified_by: str = Field(default="Government Officer")
    # Optional overrides when converting to incident
    incident_type: Optional[str] = None
    severity: Optional[str] = "medium"


class CitizenReportResponse(BaseModel):
    id: int
    report_id: str
    report_type: str
    title: str
    description: str
    latitude: float
    longitude: float
    location_name: str
    image_url: Optional[str] = None
    image_data: Optional[str] = None
    status: str
    citizen_name: Optional[str] = None
    citizen_contact: Optional[str] = None
    verification_notes: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    converted_incident_id: Optional[str] = None
    submitted_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
