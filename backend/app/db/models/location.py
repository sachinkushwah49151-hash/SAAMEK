from datetime import datetime
from typing import List, Optional
from sqlalchemy import Integer, String, Float, Boolean, DateTime, JSON, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.db.base import Base


class MonitoringLocation(Base):
    __tablename__ = "monitoring_locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_location_id: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom = mapped_column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True)
    city_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    country: Mapped[str] = mapped_column(String(100), default="India")
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)
    last_seen_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint("provider", "external_location_id", name="uq_location_provider_external_id"),
    )

    # Relationships
    city: Mapped["City"] = relationship("City", back_populates="monitoring_locations")
    sensors: Mapped[List["MonitoringSensor"]] = relationship(
        "MonitoringSensor", back_populates="location", cascade="all, delete-orphan"
    )
    measurements: Mapped[List["AirQualityMeasurement"]] = relationship(
        "AirQualityMeasurement", back_populates="location", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<MonitoringLocation id={self.id} name='{self.name}' provider='{self.provider}'>"
