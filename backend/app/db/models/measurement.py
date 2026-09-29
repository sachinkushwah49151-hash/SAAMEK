from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, Float, DateTime, JSON, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class AirQualityMeasurement(Base):
    __tablename__ = "air_quality_measurements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sensor_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("monitoring_sensors.id", ondelete="SET NULL"), nullable=True, index=True
    )
    monitoring_location_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("monitoring_locations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    parameter: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(100), default="OpenAQ", nullable=False)
    raw_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_measurement_location_param_time", "monitoring_location_id", "parameter", "measured_at"),
    )

    # Relationships
    sensor: Mapped[Optional["MonitoringSensor"]] = relationship(
        "MonitoringSensor", back_populates="measurements"
    )
    location: Mapped["MonitoringLocation"] = relationship(
        "MonitoringLocation", back_populates="measurements"
    )

    def __repr__(self) -> str:
        return f"<AirQualityMeasurement id={self.id} param='{self.parameter}' val={self.value} {self.unit}>"
