from datetime import datetime
from sqlalchemy import Integer, String, Float, Text, Boolean, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry
from app.db.base import Base


class EnvironmentalAnomaly(Base):
    __tablename__ = "environmental_anomalies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    anomaly_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    parameter: Mapped[str] = mapped_column(String(50), nullable=False)  # pm25, pm10, temperature_inversion, thermal_cluster
    baseline_value: Mapped[float] = mapped_column(Float, nullable=False)
    observed_value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    threshold_ratio: Mapped[float] = mapped_column(Float, nullable=False)  # e.g. 2.1x baseline
    station_name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom = mapped_column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True)
    location_name: Mapped[str] = mapped_column(String(255), nullable=False, default="Gwalior, Madhya Pradesh, India")
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="high")  # low, medium, high, critical
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="active", index=True
    )  # active, converted_to_incident, dismissed
    is_test_data: Mapped[bool] = mapped_column(Boolean, default=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<EnvironmentalAnomaly id={self.id} anomaly_id='{self.anomaly_id}' param='{self.parameter}'>"
