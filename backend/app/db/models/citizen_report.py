from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, Float, Text, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry
from app.db.base import Base


class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    report_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # smoke_burning, air_pollution, waste_dumping, water_pollution, other
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom = mapped_column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True)
    location_name: Mapped[str] = mapped_column(String(255), nullable=False, default="Gwalior, Madhya Pradesh, India")
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    image_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Base64 data URI for zero-config persistence
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="pending_verification", index=True
    )  # pending_verification, verified, rejected, converted_to_incident
    citizen_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="Citizen Contributor")
    citizen_contact: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    verification_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    converted_incident_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<CitizenReport id={self.id} report_id='{self.report_id}' type='{self.report_type}' status='{self.status}'>"
