"""Tests for NASA FIRMS satellite fire ingestion, coordinate validation, and deduplication."""
from datetime import datetime, timezone
import pytest
from sqlalchemy import select
from app.core.exceptions import InvalidApiKeyError, ApiTimeoutError, ExternalApiError
from app.db.models.city import City
from app.db.models.fire_detection import SatelliteFireDetection
from app.integrations.firms import FirmsClient
from app.services.firms_service import FirmsIngestionService


class MockFirmsClient:
    """Mock client for NASA FIRMS Area API."""

    def __init__(self, mode="success"):
        self.mode = mode

    def get_area_fires(self, min_lon, min_lat, max_lon, max_lat, sources=None, day_range=1):
        if self.mode == "invalid_key":
            raise InvalidApiKeyError("NASA FIRMS Authentication failed (HTTP 401)")
        elif self.mode == "timeout":
            raise ApiTimeoutError("NASA FIRMS API request timed out")
        elif self.mode == "api_error":
            raise ExternalApiError("NASA FIRMS API 500 Error", status_code=500)
        elif self.mode == "empty":
            return []

        # Return 2 detections: 1 inside Gwalior bbox, 1 far outside bbox
        return [
            {
                "external_detection_id": "firms-noaa20-26.2200-78.1800-2026-09-28-0730",
                "latitude": 26.2200,
                "longitude": 78.1800,
                "detected_at": datetime(2026, 9, 28, 7, 30, tzinfo=timezone.utc),
                "satellite": "NOAA-20",
                "instrument": "VIIRS",
                "confidence": "nominal",
                "frp": 3.4,
                "source": "NASA FIRMS (VIIRS_NOAA20_NRT)",
                "raw_data": {"test": "data"},
            },
            {
                # Outside Gwalior bounding box (lat 12.0 is near Bangalore)
                "external_detection_id": "firms-noaa20-12.0000-77.0000-2026-09-28-0730",
                "latitude": 12.0000,
                "longitude": 77.0000,
                "detected_at": datetime(2026, 9, 28, 7, 30, tzinfo=timezone.utc),
                "satellite": "NOAA-20",
                "instrument": "VIIRS",
                "confidence": "nominal",
                "frp": 12.0,
                "source": "NASA FIRMS (VIIRS_NOAA20_NRT)",
                "raw_data": {"test": "data"},
            },
        ]


def test_firms_client_unconfigured_key():
    """Verify missing NASA FIRMS API key raises InvalidApiKeyError."""
    client = FirmsClient(api_key="")
    with pytest.raises(InvalidApiKeyError) as exc_info:
        client.get_area_fires(78.05, 26.10, 78.30, 26.32)
    assert "not configured" in str(exc_info.value)


def test_firms_service_success_and_bbox_filtering(db_session):
    """Verify detections inside bbox are stored, outside are discarded, and deduplication works."""
    city = db_session.execute(select(City).where(City.name == "Gwalior")).scalar_one()
    mock_client = MockFirmsClient(mode="success")
    service = FirmsIngestionService(client=mock_client)

    # First sync
    res1 = service.sync_city(db_session, city)
    assert res1["status"] == "success"
    assert res1["detections_received"] == 2
    assert res1["detections_stored"] == 1  # Only 1 inside Gwalior bbox!

    # Verify DB record
    fire = db_session.execute(
        select(SatelliteFireDetection).where(
            SatelliteFireDetection.external_detection_id == "firms-noaa20-26.2200-78.1800-2026-09-28-0730"
        )
    ).scalar_one()
    assert fire.frp == 3.4
    assert fire.satellite == "NOAA-20"

    # Second sync: deduplication must ensure 0 new rows stored
    res2 = service.sync_city(db_session, city)
    assert res2["status"] == "success"
    assert res2["detections_stored"] == 0  # Deduplicated

    total_fires = len(db_session.execute(select(SatelliteFireDetection)).scalars().all())
    assert total_fires == 1


def test_firms_service_empty_result_reported_as_success(db_session):
    """Verify 0 detections is reported as successful empty result and NOT an error."""
    city = db_session.execute(select(City).where(City.name == "Gwalior")).scalar_one()
    mock_client = MockFirmsClient(mode="empty")
    service = FirmsIngestionService(client=mock_client)

    res = service.sync_city(db_session, city)
    assert res["status"] == "success"
    assert res["detections_received"] == 0
    assert res["detections_stored"] == 0
    assert "0 thermal detections" in res["message"]
    assert res["error"] is None


def test_firms_service_invalid_key_error(db_session):
    """Verify invalid API key reports status='invalid_api_key'."""
    city = db_session.execute(select(City).where(City.name == "Gwalior")).scalar_one()
    mock_client = MockFirmsClient(mode="invalid_key")
    service = FirmsIngestionService(client=mock_client)

    res = service.sync_city(db_session, city)
    assert res["status"] == "invalid_api_key"
    assert "401" in res["error"]
