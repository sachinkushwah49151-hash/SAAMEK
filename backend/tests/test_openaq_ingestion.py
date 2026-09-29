"""Tests for OpenAQ API client, error handling, station discovery, and measurement deduplication."""
from datetime import datetime, timezone
import pytest
from sqlalchemy import select
from app.core.exceptions import InvalidApiKeyError, ApiTimeoutError, ExternalApiError
from app.db.models.city import City
from app.db.models.location import MonitoringLocation
from app.db.models.sensor import MonitoringSensor
from app.db.models.measurement import AirQualityMeasurement
from app.integrations.openaq import OpenAQClient
from app.services.openaq_service import OpenAQIngestionService


class MockOpenAQClient:
    """Mock client for predictable OpenAQ responses."""

    def __init__(self, mode="success"):
        self.mode = mode

    def get_locations_by_bbox(self, min_lon, min_lat, max_lon, max_lat, limit=100):
        if self.mode == "invalid_key":
            raise InvalidApiKeyError("OpenAQ Authentication failed (HTTP 401)")
        elif self.mode == "timeout":
            raise ApiTimeoutError("OpenAQ API request timed out")
        elif self.mode == "api_error":
            raise ExternalApiError("OpenAQ API 500 Internal Error", status_code=500)
        elif self.mode == "empty":
            return []

        return [
            {
                "id": 8412,
                "name": "Phool Bagh, Gwalior - MPPCB",
                "provider": {"name": "CPCB / MPPCB"},
                "coordinates": {"latitude": 26.215, "longitude": 78.175},
                "datetimeLast": {"utc": "2026-09-28T19:00:00Z"},
            }
        ]

    def get_location_sensors(self, location_id):
        if self.mode != "success":
            return []
        return [
            {
                "id": 901,
                "name": "PM2.5 Sensor",
                "parameter": {"name": "pm25", "units": "µg/m³"},
            },
            {
                "id": 902,
                "name": "NO2 Sensor",
                "parameter": {"name": "no2", "units": "µg/m³"},
            },
        ]

    def get_location_latest(self, location_id):
        if self.mode != "success":
            return []
        return [
            {
                "parameter": {"name": "pm25"},
                "value": 48.5,
                "unit": "µg/m³",
                "datetime": {"utc": "2026-09-28T19:00:00Z"},
            },
            {
                "parameter": {"name": "no2"},
                "value": 24.1,
                "unit": "µg/m³",
                "datetime": {"utc": "2026-09-28T19:00:00Z"},
            },
        ]


def test_openaq_client_detects_openai_key():
    """Verify that OpenAI sk-proj keys are identified and rejected with explicit error message."""
    client = OpenAQClient(api_key="sk-proj-invalid-openai-key")
    with pytest.raises(InvalidApiKeyError) as exc_info:
        client.get_locations_by_bbox(78.05, 26.10, 78.30, 26.32)
    assert "OpenAI key format" in str(exc_info.value)


def test_openaq_client_unconfigured_key():
    """Verify missing API key raises InvalidApiKeyError."""
    client = OpenAQClient(api_key="")
    with pytest.raises(InvalidApiKeyError) as exc_info:
        client.get_locations_by_bbox(78.05, 26.10, 78.30, 26.32)
    assert "not configured" in str(exc_info.value)


def test_openaq_service_success_and_deduplication(db_session):
    """Verify location discovery, sensor registration, measurement insertion and duplicate prevention."""
    city = db_session.execute(select(City).where(City.name == "Gwalior")).scalar_one()

    mock_client = MockOpenAQClient(mode="success")
    service = OpenAQIngestionService(client=mock_client)

    # First sync
    res1 = service.sync_city(db_session, city)
    assert res1["status"] == "success"
    assert res1["locations_discovered"] == 1
    assert res1["sensors_discovered"] == 2
    assert res1["measurements_stored"] == 2

    # Verify DB state
    loc = db_session.execute(
        select(MonitoringLocation).where(MonitoringLocation.external_location_id == "8412")
    ).scalar_one()
    assert loc.name == "Phool Bagh, Gwalior - MPPCB"
    assert len(loc.sensors) == 2
    assert len(loc.measurements) == 2

    # Second sync: deduplication must ensure measurements_stored is 0 (no duplicate rows)
    res2 = service.sync_city(db_session, city)
    assert res2["status"] == "success"
    assert res2["locations_discovered"] == 1
    assert res2["measurements_stored"] == 0  # Deduplicated

    # Total measurements remain exactly 2
    meas_count = len(db_session.execute(select(AirQualityMeasurement)).scalars().all())
    assert meas_count == 2


def test_openaq_service_empty_results(db_session):
    """Verify empty results are reported as status='success' with 0 counts."""
    city = db_session.execute(select(City).where(City.name == "Gwalior")).scalar_one()
    mock_client = MockOpenAQClient(mode="empty")
    service = OpenAQIngestionService(client=mock_client)

    res = service.sync_city(db_session, city)
    assert res["status"] == "success"
    assert res["locations_discovered"] == 0
    assert res["measurements_stored"] == 0


def test_openaq_service_invalid_key_error(db_session):
    """Verify invalid API key reports status='invalid_api_key' and does not throw uncaught error."""
    city = db_session.execute(select(City).where(City.name == "Gwalior")).scalar_one()
    mock_client = MockOpenAQClient(mode="invalid_key")
    service = OpenAQIngestionService(client=mock_client)

    res = service.sync_city(db_session, city)
    assert res["status"] == "invalid_api_key"
    assert "401" in res["error"]


def test_openaq_service_timeout_error(db_session):
    """Verify timeout is cleanly identified as status='timeout'."""
    city = db_session.execute(select(City).where(City.name == "Gwalior")).scalar_one()
    mock_client = MockOpenAQClient(mode="timeout")
    service = OpenAQIngestionService(client=mock_client)

    res = service.sync_city(db_session, city)
    assert res["status"] == "timeout"
    assert "timed out" in res["error"]
