"""OpenAQ Ingestion Service for dynamic station discovery and measurement sync."""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

from app.core.logging import logger
from app.core.exceptions import InvalidApiKeyError, ApiTimeoutError, ExternalApiError
from app.db.models.city import City
from app.db.models.location import MonitoringLocation
from app.db.models.sensor import MonitoringSensor
from app.db.models.measurement import AirQualityMeasurement
from app.integrations.openaq import OpenAQClient


def _normalize_unit(raw: str) -> str:
    """Normalize common garbled unit encodings to clean Unicode characters."""
    if not raw:
        return raw
    return (
        raw
        .replace("Aµg/mA3", "µg/m³")
        .replace("A\u00b5g/mA3", "µg/m³")
        .replace("Âµg/mÂ³", "µg/m³")
        .replace("\xc2\xb5g/m\xc2\xb3", "µg/m³")
        .replace("ug/m3", "µg/m³")
    )


class OpenAQIngestionService:
    """Orchestrates dynamic ingestion from OpenAQ API v3 into database."""

    def __init__(self, client: Optional[OpenAQClient] = None):
        self.client = client or OpenAQClient()

    def sync_city(self, db: Session, city: City) -> Dict[str, Any]:
        """Discovers monitoring locations, sensors, and latest measurements within city bounding box."""
        started_at = datetime.now(timezone.utc)
        source_name = "OpenAQ API v3"
        bbox = city.bounding_box or {}

        min_lon = float(bbox.get("min_lon", 78.05))
        min_lat = float(bbox.get("min_lat", 26.10))
        max_lon = float(bbox.get("max_lon", 78.30))
        max_lat = float(bbox.get("max_lat", 26.32))

        logger.info(
            f"Starting {source_name} ingestion for {city.name} "
            f"[bbox: {min_lon}, {min_lat}, {max_lon}, {max_lat}] at {started_at.isoformat()}"
        )

        locations_discovered = 0
        sensors_discovered = 0
        measurements_stored = 0

        try:
            raw_locations = self.client.get_locations_by_bbox(
                min_lon=min_lon,
                min_lat=min_lat,
                max_lon=max_lon,
                max_lat=max_lat,
            )
            locations_discovered = len(raw_locations)

            if locations_discovered == 0:
                completed_at = datetime.now(timezone.utc)
                self._log_sync(
                    source=source_name,
                    started_at=started_at,
                    completed_at=completed_at,
                    status="success",
                    records_received=0,
                    records_saved=0,
                )
                return {
                    "status": "success",
                    "locations_discovered": 0,
                    "sensors_discovered": 0,
                    "measurements_stored": 0,
                    "message": f"Successfully queried OpenAQ v3: zero locations found in {city.name} bounding box.",
                    "error": None,
                }

            # Process each discovered location
            for loc_data in raw_locations:
                ext_loc_id = str(loc_data.get("id"))
                loc_name = loc_data.get("name") or f"OpenAQ Station #{ext_loc_id}"

                provider_raw = loc_data.get("provider")
                if isinstance(provider_raw, dict):
                    provider = provider_raw.get("name") or "OpenAQ"
                else:
                    provider = str(provider_raw or "OpenAQ")

                coords = loc_data.get("coordinates") or {}
                lat = float(coords.get("latitude") if coords.get("latitude") is not None else city.latitude)
                lon = float(coords.get("longitude") if coords.get("longitude") is not None else city.longitude)

                geom_point = WKTElement(f"POINT({lon} {lat})", srid=4326)

                # Parse last_seen_at
                last_seen_at = None
                datetime_last = loc_data.get("datetimeLast") or {}
                last_str = datetime_last.get("utc") if isinstance(datetime_last, dict) else None
                if last_str:
                    try:
                        last_seen_at = datetime.fromisoformat(last_str.replace("Z", "+00:00"))
                    except Exception:
                        pass

                # Upsert monitoring_locations
                location_stmt = select(MonitoringLocation).where(
                    MonitoringLocation.provider == provider,
                    MonitoringLocation.external_location_id == ext_loc_id,
                )
                location = db.execute(location_stmt).scalar_one_or_none()

                if location:
                    location.name = loc_name
                    location.latitude = lat
                    location.longitude = lon
                    location.geom = geom_point
                    location.last_seen_at = last_seen_at or location.last_seen_at
                    location.metadata_json = loc_data
                    location.is_active = True
                else:
                    location = MonitoringLocation(
                        external_location_id=ext_loc_id,
                        name=loc_name,
                        provider=provider,
                        latitude=lat,
                        longitude=lon,
                        geom=geom_point,
                        city_id=city.id,
                        country=city.country or "India",
                        state=city.state,
                        is_active=True,
                        metadata_json=loc_data,
                        last_seen_at=last_seen_at,
                    )
                    db.add(location)

                db.flush()

                # Discover sensors for location
                try:
                    sensors_data = self.client.get_location_sensors(ext_loc_id)
                except Exception as e:
                    logger.warning(f"Could not retrieve sensors for location #{ext_loc_id}: {e}")
                    sensors_data = []

                sensor_map: Dict[str, MonitoringSensor] = {}
                sensor_by_ext_id: Dict[str, MonitoringSensor] = {}

                for s_data in sensors_data:
                    ext_sensor_id = str(s_data.get("id"))
                    param_raw = s_data.get("parameter")
                    if isinstance(param_raw, dict):
                        parameter = str(param_raw.get("name", "")).lower().strip()
                        unit = _normalize_unit(str(param_raw.get("units", "µg/m³")).strip())
                    else:
                        parameter = str(param_raw or "").lower().strip()
                        unit = _normalize_unit(str(s_data.get("units", "µg/m³")).strip())

                    sensor_name = s_data.get("name") or f"{parameter.upper()} Sensor"

                    sensor_stmt = select(MonitoringSensor).where(
                        MonitoringSensor.provider == provider,
                        MonitoringSensor.external_sensor_id == ext_sensor_id,
                    )
                    sensor = db.execute(sensor_stmt).scalar_one_or_none()

                    if sensor:
                        sensor.parameter = parameter
                        sensor.unit = unit
                        sensor.sensor_name = sensor_name
                        sensor.metadata_json = s_data
                        sensor.is_active = True
                    else:
                        sensor = MonitoringSensor(
                            external_sensor_id=ext_sensor_id,
                            monitoring_location_id=location.id,
                            provider=provider,
                            parameter=parameter,
                            unit=unit,
                            sensor_name=sensor_name,
                            metadata_json=s_data,
                            is_active=True,
                        )
                        db.add(sensor)
                        sensors_discovered += 1

                    db.flush()
                    sensor_by_ext_id[ext_sensor_id] = sensor
                    if parameter:
                        sensor_map[parameter] = sensor

                # Retrieve latest measurements for location
                try:
                    latest_measurements = self.client.get_location_latest(ext_loc_id)
                except Exception as e:
                    logger.warning(f"Could not retrieve latest measurements for location #{ext_loc_id}: {e}")
                    latest_measurements = []

                for m_data in latest_measurements:
                    val = m_data.get("value")
                    if val is None:
                        continue

                    sensor_ref = str(m_data.get("sensorsId") or m_data.get("sensorId") or "")
                    matched_sensor = sensor_by_ext_id.get(sensor_ref)

                    param_raw = m_data.get("parameter")
                    if isinstance(param_raw, dict):
                        parameter = str(param_raw.get("name", "")).lower().strip()
                        unit = _normalize_unit(str(param_raw.get("units", "µg/m³")).strip())
                    elif param_raw:
                        parameter = str(param_raw).lower().strip()
                        unit = _normalize_unit(str(m_data.get("unit", "µg/m³")).strip())
                    elif matched_sensor:
                        parameter = matched_sensor.parameter
                        unit = matched_sensor.unit
                    else:
                        parameter = ""
                        unit = _normalize_unit(str(m_data.get("unit", "µg/m³")).strip())

                    # Parse measured_at
                    dt_val = m_data.get("datetime")
                    measured_at = None
                    if isinstance(dt_val, dict):
                        dt_str = dt_val.get("utc") or dt_val.get("local")
                    else:
                        dt_str = str(dt_val) if dt_val else None

                    if dt_str:
                        try:
                            measured_at = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                        except Exception:
                            pass
                    if not measured_at:
                        measured_at = datetime.now(timezone.utc)

                    # Deduplication check
                    meas_stmt = select(AirQualityMeasurement).where(
                        AirQualityMeasurement.monitoring_location_id == location.id,
                        AirQualityMeasurement.parameter == parameter,
                        AirQualityMeasurement.measured_at == measured_at,
                    )
                    existing_meas = db.execute(meas_stmt).scalar_one_or_none()

                    if not existing_meas:
                        assigned_sensor = matched_sensor or sensor_map.get(parameter)
                        new_meas = AirQualityMeasurement(
                            sensor_id=assigned_sensor.id if assigned_sensor else None,
                            monitoring_location_id=location.id,
                            parameter=parameter,
                            value=float(val),
                            unit=unit,
                            measured_at=measured_at,
                            source="OpenAQ",
                            raw_data=m_data,
                        )
                        db.add(new_meas)
                        measurements_stored += 1

            db.commit()
            completed_at = datetime.now(timezone.utc)
            self._log_sync(
                source=source_name,
                started_at=started_at,
                completed_at=completed_at,
                status="success",
                records_received=locations_discovered,
                records_saved=measurements_stored,
            )

            return {
                "status": "success",
                "locations_discovered": locations_discovered,
                "sensors_discovered": sensors_discovered,
                "measurements_stored": measurements_stored,
                "message": (
                    f"Successfully synced OpenAQ data for {city.name}: "
                    f"{locations_discovered} locations, {sensors_discovered} sensors, "
                    f"{measurements_stored} measurements stored."
                ),
                "error": None,
            }

        except InvalidApiKeyError as e:
            db.rollback()
            completed_at = datetime.now(timezone.utc)
            self._log_sync(
                source=source_name,
                started_at=started_at,
                completed_at=completed_at,
                status="invalid_api_key",
                records_received=0,
                records_saved=0,
                error=str(e),
            )
            return {
                "status": "invalid_api_key",
                "locations_discovered": 0,
                "sensors_discovered": 0,
                "measurements_stored": 0,
                "message": str(e),
                "error": str(e),
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
                "locations_discovered": 0,
                "sensors_discovered": 0,
                "measurements_stored": 0,
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
                "locations_discovered": 0,
                "sensors_discovered": 0,
                "measurements_stored": 0,
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
            logger.exception(f"Unhandled exception during OpenAQ ingestion: {e}")
            return {
                "status": "api_error",
                "locations_discovered": 0,
                "sensors_discovered": 0,
                "measurements_stored": 0,
                "message": f"Unexpected OpenAQ ingestion failure: {str(e)}",
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
        """Structured logging for ingestion operations."""
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
