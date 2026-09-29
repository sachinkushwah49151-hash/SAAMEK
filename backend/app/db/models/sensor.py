from datetime import datetime
from typing import List, Optional
from sqlalchemy import Integer, String, Boolean, DateTime, JSON, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class MonitoringSensor(Base):
    __tablename__ = "monitoring_sensors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_sensor_id: Mapped[str] = mapped_column(String(100), nullable=False)
    monitoring_location_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("monitoring_locations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    parameter: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)
    sensor_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint("provider", "external_sensor_id", name="uq_sensor_provider_external_id"),
    )

    # Relationships
    location: Mapped["MonitoringLocation"] = relationship("MonitoringLocation", back_populates="sensors")
    measurements: Mapped[List["AirQualityMeasurement"]] = relationship(
        "AirQualityMeasurement", back_populates="sensor", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<MonitoringSensor id={self.id} param='{self.parameter}' unit='{self.unit}'>"
