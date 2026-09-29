from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class DataSourceHealth(Base):
    __tablename__ = "data_sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_key: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )  # openaq, nasa_firms, open_meteo, citizen_reports, postgis_db
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # air_quality, satellite_thermal, weather, crowd_sourced, spatial_db
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="connected"
    )  # connected, available, degraded, unavailable
    endpoint: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    last_ping_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_success_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    records_count: Mapped[int] = mapped_column(Integer, default=0)
    details: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<DataSourceHealth key='{self.source_key}' status='{self.status}'>"
