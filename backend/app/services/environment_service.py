"""Environment Service for reading verified environmental observations for map display."""
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import CityNotFoundError
from app.db.models.city import City
from app.db.models.location import MonitoringLocation
from app.db.models.sensor import MonitoringSensor
from app.db.models.measurement import AirQualityMeasurement
from app.db.models.fire_detection import SatelliteFireDetection
from app.db.models.weather import WeatherObservation


class EnvironmentService:
    """Read queries for air quality stations, satellite fire detections, and weather observations."""

    @staticmethod
    def get_gwalior_aq_stations(db: Session) -> List[Dict[str, Any]]:
        """Returns all monitoring locations in Gwalior along with their latest measurement per parameter."""
        city = db.execute(select(City).where(City.name == "Gwalior")).scalar_one_or_none()
        if not city:
            raise CityNotFoundError("City 'Gwalior' not found.")

        locations_stmt = (
            select(MonitoringLocation)
            .where(MonitoringLocation.city_id == city.id)
            .options(selectinload(MonitoringLocation.sensors))
        )
        locations = db.execute(locations_stmt).scalars().all()

        station_results: List[Dict[str, Any]] = []

        for loc in locations:
            # Query all measurements ordered by latest first
            meas_stmt = (
                select(AirQualityMeasurement)
                .where(AirQualityMeasurement.monitoring_location_id == loc.id)
                .order_by(AirQualityMeasurement.measured_at.desc())
            )
            measurements = db.execute(meas_stmt).scalars().all()

            # Keep only the latest measurement for each distinct parameter
            seen_params = set()
            latest_meas_list = []
            for m in measurements:
                p_norm = m.parameter.lower()
                if p_norm not in seen_params:
                    seen_params.add(p_norm)
                    # Normalize garbled µg/m³ encoding artifacts from SQLite
                    raw_unit = m.unit or ""
                    clean_unit = (
                        raw_unit
                        .replace("A\u00b5g/mA3", "µg/m³")
                        .replace("�g/m�", "µg/m³")
                        .replace("Âµg/mÂ³", "µg/m³")
                        .replace("ug/m3", "µg/m³")
                    )
                    latest_meas_list.append({
                        "parameter": m.parameter,
                        "value": m.value,
                        "unit": clean_unit,
                        "measured_at": m.measured_at,
                        "source": m.source,
                    })

            station_results.append({
                "id": loc.id,
                "external_location_id": loc.external_location_id,
                "name": loc.name,
                "provider": loc.provider,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "city_id": loc.city_id,
                "country": loc.country,
                "state": loc.state,
                "is_active": loc.is_active,
                "last_seen_at": loc.last_seen_at,
                "sensors": [
                    {
                        "id": s.id,
                        "external_sensor_id": s.external_sensor_id,
                        "parameter": s.parameter,
                        "unit": (
                            (s.unit or "")
                            .replace("A\u00b5g/mA3", "µg/m³")
                            .replace("g/m", "µg/m³")
                            .replace("Âµg/mÂ³", "µg/m³")
                            .replace("ug/m3", "µg/m³")
                        ),
                        "sensor_name": s.sensor_name,
                        "is_active": s.is_active,
                    }
                    for s in loc.sensors
                ],
                "latest_measurements": latest_meas_list,
            })

        return station_results

    @staticmethod
    def get_gwalior_fires(db: Session, limit: int = 100) -> List[SatelliteFireDetection]:
        """Returns recent NASA FIRMS detections within Gwalior bounding box."""
        city = db.execute(select(City).where(City.name == "Gwalior")).scalar_one_or_none()
        if not city:
            raise CityNotFoundError("City 'Gwalior' not found.")

        bbox = city.bounding_box or {}
        min_lon = float(bbox.get("min_lon", 78.05))
        min_lat = float(bbox.get("min_lat", 26.10))
        max_lon = float(bbox.get("max_lon", 78.30))
        max_lat = float(bbox.get("max_lat", 26.32))

        stmt = (
            select(SatelliteFireDetection)
            .where(
                SatelliteFireDetection.latitude >= min_lat - 0.05,
                SatelliteFireDetection.latitude <= max_lat + 0.05,
                SatelliteFireDetection.longitude >= min_lon - 0.05,
                SatelliteFireDetection.longitude <= max_lon + 0.05,
            )
            .order_by(SatelliteFireDetection.detected_at.desc())
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def get_gwalior_weather(db: Session) -> Optional[WeatherObservation]:
        """Returns latest meteorological observation recorded for Gwalior."""
        city = db.execute(select(City).where(City.name == "Gwalior")).scalar_one_or_none()
        if not city:
            raise CityNotFoundError("City 'Gwalior' not found.")

        stmt = (
            select(WeatherObservation)
            .where(WeatherObservation.city_id == city.id)
            .order_by(WeatherObservation.observed_at.desc())
            .limit(1)
        )
        return db.execute(stmt).scalar_one_or_none()
