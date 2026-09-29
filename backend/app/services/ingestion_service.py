"""Orchestration Ingestion Service for live environmental feeds."""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import CityNotFoundError
from app.db.models.city import City
from app.services.openaq_service import OpenAQIngestionService
from app.services.firms_service import FirmsIngestionService
from app.services.weather_service import WeatherIngestionService


class IngestionService:
    """Coordinates multi-source environmental data ingestion across OpenAQ, FIRMS, and Open-Meteo."""

    def __init__(
        self,
        openaq_svc: Optional[OpenAQIngestionService] = None,
        firms_svc: Optional[FirmsIngestionService] = None,
        weather_svc: Optional[WeatherIngestionService] = None,
    ):
        self.openaq_svc = openaq_svc or OpenAQIngestionService()
        self.firms_svc = firms_svc or FirmsIngestionService()
        self.weather_svc = weather_svc or WeatherIngestionService()

    def sync_city(self, db: Session, city_name: str = "Gwalior") -> Dict[str, Any]:
        """Runs full ingestion cycle for specified city."""
        stmt = select(City).where(City.name.ilike(city_name), City.is_active == True)
        city = db.execute(stmt).scalar_one_or_none()

        if not city:
            raise CityNotFoundError(f"Active city '{city_name}' not found in database.")

        # 1. OpenAQ sync
        openaq_res = self.openaq_svc.sync_city(db, city)

        # 2. NASA FIRMS sync
        firms_res = self.firms_svc.sync_city(db, city)

        # 3. Open-Meteo weather sync
        weather_res = self.weather_svc.sync_city(db, city)

        synced_at = datetime.now(timezone.utc).isoformat()

        return {
            "city": city.name,
            "openaq": openaq_res,
            "firms": firms_res,
            "weather": weather_res,
            "synced_at": synced_at,
        }

    def sync_gwalior(self, db: Session) -> Dict[str, Any]:
        """Convenience method for the Gwalior pilot city ingestion sync."""
        return self.sync_city(db, city_name="Gwalior")
