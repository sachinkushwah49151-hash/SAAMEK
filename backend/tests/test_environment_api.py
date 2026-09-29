"""Tests for Environmental read endpoints: /aq-stations, /fires, /weather."""
from datetime import datetime, timezone
from geoalchemy2.elements import WKTElement
from app.db.models.city import City
from app.db.models.location import MonitoringLocation
from app.db.models.sensor import MonitoringSensor
from app.db.models.measurement import AirQualityMeasurement
from app.db.models.fire_detection import SatelliteFireDetection
from app.db.models.weather import WeatherObservation


def test_get_gwalior_aq_stations_empty(client):
    """Verify endpoint returns empty list when no stations exist."""
    response = client.get("/api/environment/gwalior/aq-stations")
    assert response.status_code == 200
    assert response.json() == []


def test_get_gwalior_aq_stations_with_data(client, db_session):
    """Verify endpoint returns monitoring stations with latest measurements."""
    city = db_session.query(City).filter(City.name == "Gwalior").first()

    # Create location
    loc = MonitoringLocation(
        external_location_id="loc-gw-01",
        name="Phool Bagh CAAQMS",
        provider="OpenAQ",
        latitude=26.218,
        longitude=78.182,
        city_id=city.id,
        country="India",
        state="Madhya Pradesh",
        is_active=True,
    )
    db_session.add(loc)
    db_session.commit()
    db_session.refresh(loc)

    # Create sensor
    sensor = MonitoringSensor(
        external_sensor_id="sensor-pm25-01",
        monitoring_location_id=loc.id,
        provider="OpenAQ",
        parameter="pm25",
        unit="µg/m³",
        sensor_name="PM2.5 Sensor",
        is_active=True,
    )
    db_session.add(sensor)
    db_session.commit()
    db_session.refresh(sensor)

    # Create measurements (older and newer)
    m1 = AirQualityMeasurement(
        sensor_id=sensor.id,
        monitoring_location_id=loc.id,
        parameter="pm25",
        value=52.0,
        unit="µg/m³",
        measured_at=datetime(2026, 9, 28, 18, 0, tzinfo=timezone.utc),
        source="OpenAQ",
    )
    m2 = AirQualityMeasurement(
        sensor_id=sensor.id,
        monitoring_location_id=loc.id,
        parameter="pm25",
        value=48.2,
        unit="µg/m³",
        measured_at=datetime(2026, 9, 28, 19, 0, tzinfo=timezone.utc),
        source="OpenAQ",
    )
    db_session.add_all([m1, m2])
    db_session.commit()

    response = client.get("/api/environment/gwalior/aq-stations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    station = data[0]
    assert station["name"] == "Phool Bagh CAAQMS"
    assert len(station["sensors"]) == 1
    assert len(station["latest_measurements"]) == 1
    # Latest measurement value should be 48.2 (from 19:00, not 18:00)
    assert station["latest_measurements"][0]["value"] == 48.2


def test_get_gwalior_fires(client, db_session):
    """Verify endpoint returns satellite fire detections in Gwalior."""
    fire = SatelliteFireDetection(
        external_detection_id="firms-test-01",
        latitude=26.22,
        longitude=78.18,
        geom=WKTElement("POINT(78.18 26.22)", srid=4326),
        detected_at=datetime(2026, 9, 28, 7, 30, tzinfo=timezone.utc),
        satellite="NOAA-20",
        instrument="VIIRS",
        confidence="nominal",
        frp=5.8,
        source="NASA FIRMS",
    )
    db_session.add(fire)
    db_session.commit()

    response = client.get("/api/environment/gwalior/fires")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["external_detection_id"] == "firms-test-01"
    assert data[0]["frp"] == 5.8


def test_get_gwalior_weather(client, db_session):
    """Verify endpoint returns latest weather observation for Gwalior."""
    city = db_session.query(City).filter(City.name == "Gwalior").first()

    obs = WeatherObservation(
        city_id=city.id,
        latitude=city.latitude,
        longitude=city.longitude,
        geom=WKTElement(f"POINT({city.longitude} {city.latitude})", srid=4326),
        temperature=25.4,
        humidity=78.0,
        pressure=989.1,
        wind_speed=9.5,
        wind_direction=230.0,
        weather_code=0,
        observed_at=datetime(2026, 9, 28, 19, 0, tzinfo=timezone.utc),
        source="Open-Meteo",
    )
    db_session.add(obs)
    db_session.commit()

    response = client.get("/api/environment/gwalior/weather")
    assert response.status_code == 200
    data = response.json()
    assert data is not None
    assert data["temperature"] == 25.4
    assert data["wind_speed"] == 9.5
    assert data["humidity"] == 78.0
