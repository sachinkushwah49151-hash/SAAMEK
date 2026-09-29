from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, Float, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.db.base import Base


class EnvironmentalHotspot(Base):
    __tablename__ = "environmental_hotspots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    city_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom = mapped_column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True)
    radius: Mapped[float] = mapped_column(Float, default=3500.0, nullable=False)  # in meters
    hotspot_type: Mapped[str] = mapped_column(
        String(100), default="thermal_anomaly_cluster", nullable=False
    )
    source_signal_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    confidence: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    derived_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    city: Mapped["City"] = relationship("City", back_populates="environmental_hotspots")

    def __repr__(self) -> str:
        return f"<EnvironmentalHotspot id={self.id} type='{self.hotspot_type}' radius={self.radius}m at={self.derived_at}>"
