from datetime import datetime
from typing import Optional, List
from sqlalchemy import Integer, String, Float, Text, Boolean, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.db.base import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    incident_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    incident_type: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )  # potential_open_burning, air_pollution_spike, waste_dumping_hazard, industrial_emission, thermal_anomaly
    severity: Mapped[str] = mapped_column(
        String(50), nullable=False, default="medium", index=True
    )  # low, medium, high, critical
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="detected", index=True
    )  # detected, verified, investigating, response_initiated, resolved
    confidence: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")  # low, medium, high
    origin: Mapped[str] = mapped_column(
        String(100), nullable=False, default="environmental_anomaly"
    )  # citizen_report, satellite_fire, environmental_anomaly, aqi_spike, multi_source_correlation
    description: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom = mapped_column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True)
    location_name: Mapped[str] = mapped_column(String(255), nullable=False, default="Gwalior, Madhya Pradesh, India")
    affected_area: Mapped[str] = mapped_column(String(255), nullable=False, default="Gwalior Airshed")
    affected_radius_meters: Mapped[int] = mapped_column(Integer, default=1500)
    assigned_officer: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    citizen_report_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_test_data: Mapped[bool] = mapped_column(Boolean, default=False)

    # Wind/Impact trajectory context
    wind_speed: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    wind_direction: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    wind_cardinal: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    potential_impact_area: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Air Quality Context
    pm25_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    pm10_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    nearest_station_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    metadata_json: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    evidence_items: Mapped[List["IncidentEvidence"]] = relationship(
        "IncidentEvidence", back_populates="incident", cascade="all, delete-orphan", order_by="IncidentEvidence.id"
    )
    status_history: Mapped[List["IncidentStatusHistory"]] = relationship(
        "IncidentStatusHistory", back_populates="incident", cascade="all, delete-orphan", order_by="IncidentStatusHistory.id.desc()"
    )

    def __repr__(self) -> str:
        return f"<Incident id={self.id} incident_id='{self.incident_id}' status='{self.status}' severity='{self.severity}'>"
