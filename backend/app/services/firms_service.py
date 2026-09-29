"""NASA FIRMS Ingestion Service for satellite fire and thermal anomaly detection."""
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

from app.core.logging import logger
from app.core.exceptions import InvalidApiKeyError, ApiTimeoutError, ExternalApiError
from app.db.models.city import City
from app.db.models.fire_detection import SatelliteFireDetection
from app.integrations.firms import FirmsClient


class FirmsIngestionService:
    """Orchestrates NASA FIRMS satellite fire ingestion into database."""

    def __init__(self, client: Optional[FirmsClient] = None):
        self.client = client or FirmsClient()

    def sync_city(
        self,
        db: Session,
        city: City,
        sources: Optional[List[str]] = None,
        day_range: int = 1,
    ) -> Dict[str, Any]:
        """Queries NASA FIRMS Area API for thermal anomalies and stores verified detections."""
        started_at = datetime.now(timezone.utc)
        source_name = "NASA FIRMS (VIIRS NRT)"
        bbox = city.bounding_box or {}

        min_lon = float(bbox.get("min_lon", 78.05))
        min_lat = float(bbox.get("min_lat", 26.10))
        max_lon = float(bbox.get("max_lon", 78.30))
        max_lat = float(bbox.get("max_lat", 26.32))

        logger.info(
            f"Starting {source_name} ingestion for {city.name} "
            f"[bbox: {min_lon}, {min_lat}, {max_lon}, {max_lat}, days={day_range}] at {started_at.isoformat()}"
        )

        detections_received = 0
        detections_stored = 0

        try:
            detections = self.client.get_area_fires(
                min_lon=min_lon,
                min_lat=min_lat,
                max_lon=max_lon,
                max_lat=max_lat,
                sources=sources,
                day_range=day_range,
            )
            detections_received = len(detections)

            if detections_received == 0:
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
                    "detections_received": 0,
                    "detections_stored": 0,
                    "message": f"Successfully queried NASA FIRMS: 0 thermal detections in {city.name} bounding box.",
                    "error": None,
                }

            # Process detections with coordinate validation and deduplication
            for det in detections:
                lat = det["latitude"]
                lon = det["longitude"]

                # Validate coordinates within city bounding box (with slight tolerance for edge pixels)
                if not (min_lat - 0.05 <= lat <= max_lat + 0.05 and min_lon - 0.05 <= lon <= max_lon + 0.05):
                    logger.debug(f"Skipping detection outside bounding box: [{lat}, {lon}]")
                    continue

                ext_id = det["external_detection_id"]
                detected_at = det["detected_at"]
                satellite = det["satellite"]

                # Deduplication check
                stmt = select(SatelliteFireDetection).where(
                    or_(
                        SatelliteFireDetection.external_detection_id == ext_id,
                        (
                            (SatelliteFireDetection.latitude == lat)
                            & (SatelliteFireDetection.longitude == lon)
                            & (SatelliteFireDetection.detected_at == detected_at)
                            & (SatelliteFireDetection.satellite == satellite)
                        ),
                    )
                )
                existing = db.execute(stmt).scalar_one_or_none()

                if not existing:
                    geom_point = WKTElement(f"POINT({lon} {lat})", srid=4326)
                    new_fire = SatelliteFireDetection(
                        external_detection_id=ext_id,
                        latitude=lat,
                        longitude=lon,
                        geom=geom_point,
                        detected_at=detected_at,
                        satellite=satellite,
                        instrument=det.get("instrument", "VIIRS"),
                        confidence=det.get("confidence"),
                        frp=det.get("frp"),
                        source=det.get("source", "NASA FIRMS"),
                        raw_data=det.get("raw_data"),
                    )
                    db.add(new_fire)
                    detections_stored += 1

            db.commit()
            completed_at = datetime.now(timezone.utc)
            self._log_sync(
                source=source_name,
                started_at=started_at,
                completed_at=completed_at,
                status="success",
                records_received=detections_received,
                records_saved=detections_stored,
            )

            return {
                "status": "success",
                "detections_received": detections_received,
                "detections_stored": detections_stored,
                "message": (
                    f"Successfully synced NASA FIRMS for {city.name}: "
                    f"{detections_received} received, {detections_stored} stored."
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
                "detections_received": 0,
                "detections_stored": 0,
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
                "detections_received": 0,
                "detections_stored": 0,
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
                "detections_received": 0,
                "detections_stored": 0,
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
            logger.exception(f"Unhandled exception during NASA FIRMS ingestion: {e}")
            return {
                "status": "api_error",
                "detections_received": 0,
                "detections_stored": 0,
                "message": f"Unexpected NASA FIRMS ingestion failure: {str(e)}",
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
