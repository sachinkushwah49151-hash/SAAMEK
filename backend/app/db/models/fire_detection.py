from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, Float, DateTime, JSON, Index, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry
from app.db.base import Base


class SatelliteFireDetection(Base):
    __tablename__ = "satellite_fire_detections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_detection_id: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom = mapped_column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    satellite: Mapped[str] = mapped_column(String(100), nullable=False)
    instrument: Mapped[str] = mapped_column(String(50), default="VIIRS", nullable=False)
    confidence: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    frp: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Fire Radiative Power (MW)
    source: Mapped[str] = mapped_column(String(100), default="NASA FIRMS", nullable=False)
    raw_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_fire_coords_time", "latitude", "longitude", "detected_at"),
        UniqueConstraint("latitude", "longitude", "detected_at", "satellite", name="uq_fire_location_time_sat"),
    )

    def __repr__(self) -> str:
        return f"<SatelliteFireDetection id={self.id} sat='{self.satellite}' frp={self.frp} at={self.detected_at}>"
