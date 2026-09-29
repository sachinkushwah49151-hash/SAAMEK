from datetime import datetime
from typing import List, Optional
from sqlalchemy import Integer, String, Float, Boolean, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.db.base import Base


class City(Base):
    __tablename__ = "cities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom = mapped_column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True)
    bounding_box: Mapped[dict] = mapped_column(JSON, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    monitoring_locations: Mapped[List["MonitoringLocation"]] = relationship(
        "MonitoringLocation", back_populates="city", cascade="all, delete-orphan"
    )
    weather_observations: Mapped[List["WeatherObservation"]] = relationship(
        "WeatherObservation", back_populates="city", cascade="all, delete-orphan"
    )
    environmental_hotspots: Mapped[List["EnvironmentalHotspot"]] = relationship(
        "EnvironmentalHotspot", back_populates="city", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<City id={self.id} name='{self.name}' state='{self.state}'>"
