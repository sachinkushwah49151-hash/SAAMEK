"""NASA FIRMS Satellite Thermal Anomaly & Fire Ingestion Client."""
import csv
import io
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import InvalidApiKeyError, ApiTimeoutError, ExternalApiError


class FirmsClient:
    """Client for querying the NASA FIRMS Area API."""

    BASE_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

    DEFAULT_SOURCES = ["VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT"]

    def __init__(self, api_key: Optional[str] = None, timeout_seconds: float = 20.0):
        if api_key is not None:
            self.api_key = api_key.strip()
        else:
            self.api_key = (settings.NASA_FIRMS_API_KEY or "").strip()
        self.timeout_seconds = timeout_seconds

    def _check_key_configured(self) -> None:
        if not self.api_key:
            raise InvalidApiKeyError(
                "NASA FIRMS API key is not configured. Set NASA_FIRMS_API_KEY in the environment."
            )

    def get_area_fires(
        self,
        min_lon: float,
        min_lat: float,
        max_lon: float,
        max_lat: float,
        sources: Optional[List[str]] = None,
        day_range: int = 1,
    ) -> List[Dict[str, Any]]:
        """Queries NASA FIRMS Area API for thermal anomalies across selected VIIRS sources."""
        self._check_key_configured()

        selected_sources = sources or self.DEFAULT_SOURCES
        bbox_str = f"{min_lon:.4f},{min_lat:.4f},{max_lon:.4f},{max_lat:.4f}"
        all_detections: List[Dict[str, Any]] = []
        seen_detection_ids = set()

        for source in selected_sources:
            url = f"{self.BASE_URL}/{self.api_key}/{source}/{bbox_str}/{day_range}"

            try:
                with httpx.Client(timeout=self.timeout_seconds) as client:
                    # Log query without revealing the secret API key
                    logger.info(f"Querying NASA FIRMS ({source}) for bbox: {bbox_str}, day_range: {day_range}")
                    response = client.get(url)

                    if response.status_code in (401, 403):
                        raise InvalidApiKeyError(
                            f"NASA FIRMS Authentication failed (HTTP {response.status_code}). Invalid NASA_FIRMS_API_KEY."
                        )
                    elif response.status_code >= 400:
                        raise ExternalApiError(
                            f"NASA FIRMS Area API error for source {source} (HTTP {response.status_code}): {response.text}",
                            status_code=response.status_code,
                            response_text=response.text,
                        )

                    csv_text = response.text.strip()
                    if not csv_text:
                        continue

                    detections = self._parse_firms_csv(csv_text, source)
                    for det in detections:
                        det_id = det["external_detection_id"]
                        if det_id not in seen_detection_ids:
                            seen_detection_ids.add(det_id)
                            all_detections.append(det)

            except httpx.TimeoutException as e:
                logger.error(f"NASA FIRMS request timed out for {source}: {e}")
                raise ApiTimeoutError(f"NASA FIRMS API request timed out after {self.timeout_seconds}s")
            except (InvalidApiKeyError, ExternalApiError, ApiTimeoutError):
                raise
            except Exception as e:
                logger.error(f"Unexpected error calling NASA FIRMS API ({source}): {e}")
                raise ExternalApiError(f"NASA FIRMS communication failure: {str(e)}")

        logger.info(f"NASA FIRMS aggregated {len(all_detections)} distinct detection(s) across {selected_sources}")
        return all_detections

    def _parse_firms_csv(self, csv_content: str, default_source: str) -> List[Dict[str, Any]]:
        """Parses NASA FIRMS CSV stream into normalized detection records."""
        results: List[Dict[str, Any]] = []
        reader = csv.DictReader(io.StringIO(csv_content))

        for row in reader:
            try:
                lat_str = row.get("latitude")
                lon_str = row.get("longitude")
                if not lat_str or not lon_str:
                    continue

                lat = float(lat_str)
                lon = float(lon_str)

                acq_date = row.get("acq_date", "").strip()  # Format: YYYY-MM-DD
                acq_time = row.get("acq_time", "").strip()  # Format: HHMM (e.g. '0730')

                # Parse UTC timestamp
                detected_at = self._parse_acq_datetime(acq_date, acq_time)

                sat_name = row.get("satellite", "").strip()
                if not sat_name:
                    sat_name = "NOAA-20" if "NOAA20" in default_source else "NOAA-21" if "NOAA21" in default_source else "Suomi-NPP"

                instrument = row.get("instrument", "VIIRS").strip()
                confidence = row.get("confidence", "nominal").strip()

                frp_val: Optional[float] = None
                if row.get("frp"):
                    try:
                        frp_val = float(row["frp"])
                    except (ValueError, TypeError):
                        pass

                # Deterministic deduplication key
                ext_id = f"firms-{sat_name.lower()}-{lat:.4f}-{lon:.4f}-{acq_date}-{acq_time}"

                results.append({
                    "external_detection_id": ext_id,
                    "latitude": lat,
                    "longitude": lon,
                    "detected_at": detected_at,
                    "satellite": sat_name,
                    "instrument": instrument,
                    "confidence": confidence,
                    "frp": frp_val,
                    "source": f"NASA FIRMS ({default_source})",
                    "raw_data": dict(row),
                })
            except Exception as e:
                logger.warning(f"Error parsing FIRMS row {row}: {e}")
                continue

        return results

    @staticmethod
    def _parse_acq_datetime(acq_date: str, acq_time: str) -> datetime:
        """Parses FIRMS date and HHMM string into timezone-aware UTC datetime."""
        try:
            if acq_date and acq_time:
                padded_time = acq_time.zfill(4)
                dt_str = f"{acq_date} {padded_time}"
                dt = datetime.strptime(dt_str, "%Y-%m-%d %H%M")
                return dt.replace(tzinfo=timezone.utc)
            elif acq_date:
                dt = datetime.strptime(acq_date, "%Y-%m-%d")
                return dt.replace(tzinfo=timezone.utc)
        except Exception:
            pass
        return datetime.now(timezone.utc)
