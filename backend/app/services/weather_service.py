"""Open-Meteo Weather & Wind Ingestion Service."""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

from app.core.logging import logger
from app.core.exceptions import ApiTimeoutError, ExternalApiError
from app.db.models.city import City
from app.db.models.weather import WeatherObservation
from app.integrations.open_meteo import OpenMeteoClient


class WeatherIngestionService:
    """Orchestrates live meteorological telemetry ingestion into database."""

    def __init__(self, client: Optional[OpenMeteoClient] = None):
        self.client = client or OpenMeteoClient()

    def sync_city(self, db: Session, city: City) -> Dict[str, Any]:
        """Fetches current temperature, humidity, pressure, and wind vectors for city coordinates."""
        started_at = datetime.now(timezone.utc)
        source_name = "Open-Meteo Weather"

        logger.info(
            f"Starting {source_name} ingestion for {city.name} "
            f"[lat={city.latitude}, lon={city.longitude}] at {started_at.isoformat()}"
        )

        try:
            weather_data = self.client.get_current_weather(city.latitude, city.longitude)
            observed_at = weather_data["observed_at"]

            # Deduplication / Upsert check for (city_id, observed_at)
            stmt = select(WeatherObservation).where(
                WeatherObservation.city_id == city.id,
                WeatherObservation.observed_at == observed_at,
            )
            existing = db.execute(stmt).scalar_one_or_none()

            geom_point = WKTElement(f"POINT({city.longitude} {city.latitude})", srid=4326)

            if existing:
                existing.temperature = weather_data["temperature"]
                existing.humidity = weather_data["humidity"]
                existing.pressure = weather_data["pressure"]
                existing.wind_speed = weather_data["wind_speed"]
                existing.wind_direction = weather_data["wind_direction"]
                existing.weather_code = weather_data["weather_code"]
                existing.raw_data = weather_data["raw_data"]
                obs = existing
            else:
                obs = WeatherObservation(
                    city_id=city.id,
                    latitude=city.latitude,
                    longitude=city.longitude,
                    geom=geom_point,
                    temperature=weather_data["temperature"],
                    humidity=weather_data["humidity"],
                    pressure=weather_data["pressure"],
                    wind_speed=weather_data["wind_speed"],
                    wind_direction=weather_data["wind_direction"],
                    weather_code=weather_data["weather_code"],
                    observed_at=observed_at,
                    source=weather_data["source"],
                    raw_data=weather_data["raw_data"],
                )
                db.add(obs)

            db.commit()
            completed_at = datetime.now(timezone.utc)
            self._log_sync(
                source=source_name,
                started_at=started_at,
                completed_at=completed_at,
                status="success",
                records_received=1,
                records_saved=1,
            )

            return {
                "status": "success",
                "observation_stored": True,
                "observed_at": observed_at.isoformat(),
                "temperature": weather_data["temperature"],
                "humidity": weather_data["humidity"],
                "pressure": weather_data["pressure"],
                "wind_speed": weather_data["wind_speed"],
                "wind_direction": weather_data["wind_direction"],
                "weather_code": weather_data["weather_code"],
                "message": f"Successfully synced current weather observation for {city.name}.",
                "error": None,
            }

        except ApiTimeoutError as e:
            db.rollback()
            completed_at = datetime.now(timezone.utc)
            self._log_sync(
                source=source_name,
                started_at=started_at,
                completed_at=completed_at,
                status="timeout",
                records_received=0,
                records_saved=0,
                error=str(e),
            )
            return {
                "status": "timeout",
                "observation_stored": False,
                "message": str(e),
                "error": str(e),
            }

        except ExternalApiError as e:
            db.rollback()
            completed_at = datetime.now(timezone.utc)
            self._log_sync(
                source=source_name,
                started_at=started_at,
                completed_at=completed_at,
                status="api_error",
                records_received=0,
                records_saved=0,
                error=str(e),
            )
            return {
                "status": "api_error",
                "observation_stored": False,
                "message": str(e),
                "error": str(e),
            }

        except Exception as e:
            db.rollback()
            completed_at = datetime.now(timezone.utc)
            self._log_sync(
                source=source_name,
                started_at=started_at,
                completed_at=completed_at,
                status="api_error",
                records_received=0,
                records_saved=0,
                error=str(e),
            )
            logger.exception(f"Unhandled exception during weather ingestion: {e}")
            return {
                "status": "api_error",
                "observation_stored": False,
                "message": f"Unexpected weather ingestion failure: {str(e)}",
                "error": str(e),
            }

    @staticmethod
    def _log_sync(
        source: str,
        started_at: datetime,
        completed_at: datetime,
        status: str,
        records_received: int,
        records_saved: int,
        error: Optional[str] = None,
    ) -> None:
        duration_ms = (completed_at - started_at).total_seconds() * 1000
        msg = (
            f"[INGESTION_SYNC] source='{source}' status='{status}' "
            f"started_at='{started_at.isoformat()}' completed_at='{completed_at.isoformat()}' "
            f"duration_ms={duration_ms:.1f} records_received={records_received} "
            f"records_saved={records_saved}"
        )
        if error:
            msg += f" error='{error}'"
            logger.error(msg)
        else:
            logger.info(msg)
