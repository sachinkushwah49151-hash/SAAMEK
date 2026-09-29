"""Tests for Open-Meteo weather ingestion, normalization, and deduplication."""
from datetime import datetime, timezone
import pytest
from sqlalchemy import select
from app.core.exceptions import ApiTimeoutError, ExternalApiError
from app.db.models.city import City
from app.db.models.weather import WeatherObservation
from app.services.weather_service import WeatherIngestionService


class MockOpenMeteoClient:
    """Mock client for Open-Meteo telemetry."""

    def __init__(self, mode="success"):
        self.mode = mode

    def get_current_weather(self, latitude, longitude):
        if self.mode == "timeout":
            raise ApiTimeoutError("Open-Meteo API timed out")
        elif self.mode == "api_error":
            raise ExternalApiError("Open-Meteo 500 error", status_code=500)

        return {
            "temperature": 26.5,
            "humidity": 72.0,
            "pressure": 988.2,
            "wind_speed": 11.4,
            "wind_direction": 220.0,
            "weather_code": 1,
            "observed_at": datetime(2026, 9, 28, 19, 30, tzinfo=timezone.utc),
            "source": "Open-Meteo",
            "raw_data": {"temp": 26.5},
        }


def test_weather_service_sync_and_upsert(db_session):
    """Verify weather observation insertion and subsequent upsert without duplication."""
    city = db_session.execute(select(City).where(City.name == "Gwalior")).scalar_one()
    mock_client = MockOpenMeteoClient(mode="success")
    service = WeatherIngestionService(client=mock_client)

    # First sync
    res1 = service.sync_city(db_session, city)
    assert res1["status"] == "success"
    assert res1["observation_stored"] is True
    assert res1["temperature"] == 26.5
    assert res1["wind_speed"] == 11.4

    # Verify DB record
    obs = db_session.execute(
        select(WeatherObservation).where(WeatherObservation.city_id == city.id)
    ).scalar_one()
    assert obs.temperature == 26.5
    assert obs.humidity == 72.0
    assert obs.wind_speed == 11.4

    # Second sync with updated values for same timestamp
    mock_client.get_current_weather = lambda lat, lon: {
        "temperature": 27.0,
        "humidity": 70.0,
        "pressure": 988.5,
        "wind_speed": 12.0,
        "wind_direction": 225.0,
        "weather_code": 1,
        "observed_at": datetime(2026, 9, 28, 19, 30, tzinfo=timezone.utc),
        "source": "Open-Meteo",
        "raw_data": {},
    }

    res2 = service.sync_city(db_session, city)
    assert res2["status"] == "success"
    assert res2["temperature"] == 27.0

    # Ensure total rows is still 1 (upserted, not duplicated!)
    all_obs = db_session.execute(
        select(WeatherObservation).where(WeatherObservation.city_id == city.id)
    ).scalars().all()
    assert len(all_obs) == 1
    assert all_obs[0].temperature == 27.0


def test_weather_service_timeout(db_session):
    """Verify timeout is handled cleanly."""
    city = db_session.execute(select(City).where(City.name == "Gwalior")).scalar_one()
    mock_client = MockOpenMeteoClient(mode="timeout")
    service = WeatherIngestionService(client=mock_client)

    res = service.sync_city(db_session, city)
    assert res["status"] == "timeout"
    assert res["observation_stored"] is False
