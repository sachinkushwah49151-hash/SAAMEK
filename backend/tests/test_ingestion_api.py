"""Tests for POST /api/ingestion/gwalior/sync endpoint."""
from datetime import datetime, timezone
import pytest
from app.main import app
from app.api.routes.ingestion import get_ingestion_service
from app.services.ingestion_service import IngestionService
from app.services.openaq_service import OpenAQIngestionService
from app.services.firms_service import FirmsIngestionService
from app.services.weather_service import WeatherIngestionService
from tests.test_openaq_ingestion import MockOpenAQClient
from tests.test_firms_ingestion import MockFirmsClient
from tests.test_weather_ingestion import MockOpenMeteoClient


def test_post_gwalior_sync_endpoint(client, db_session):
    """Verify POST /api/ingestion/gwalior/sync executes successfully and returns valid summary."""
    # Dependency override to inject mock clients
    mock_openaq_svc = OpenAQIngestionService(client=MockOpenAQClient(mode="success"))
    mock_firms_svc = FirmsIngestionService(client=MockFirmsClient(mode="success"))
    mock_weather_svc = WeatherIngestionService(client=MockOpenMeteoClient(mode="success"))
    custom_ingestion = IngestionService(
        openaq_svc=mock_openaq_svc,
        firms_svc=mock_firms_svc,
        weather_svc=mock_weather_svc,
    )

    app.dependency_overrides[get_ingestion_service] = lambda: custom_ingestion

    try:
        response = client.post("/api/ingestion/gwalior/sync")
        assert response.status_code == 200

        data = response.json()
        assert data["city"] == "Gwalior"
        assert "openaq" in data
        assert "firms" in data
        assert "weather" in data
        assert "synced_at" in data

        # Check OpenAQ summary
        assert data["openaq"]["status"] == "success"
        assert data["openaq"]["locations_discovered"] == 1
        assert data["openaq"]["measurements_stored"] == 2

        # Check FIRMS summary
        assert data["firms"]["status"] == "success"
        assert data["firms"]["detections_received"] == 2
        assert data["firms"]["detections_stored"] == 1

        # Check Weather summary
        assert data["weather"]["status"] == "success"
        assert data["weather"]["observation_stored"] is True
        assert data["weather"]["temperature"] == 26.5

        # Security check: Ensure no API keys or secrets are leaked in response
        response_text = response.text.lower()
        assert "key" not in data
        assert "api_key" not in data
        assert "database_url" not in response_text
        assert "postgres" not in response_text

    finally:
        app.dependency_overrides.pop(IngestionService, None)
