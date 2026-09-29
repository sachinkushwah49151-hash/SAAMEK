from sqlalchemy import select, inspect
from app.db.base import Base
from app.db.models import (
    City,
    MonitoringLocation,
    MonitoringSensor,
    AirQualityMeasurement,
    SatelliteFireDetection,
    WeatherObservation,
    EnvironmentalHotspot,
)
from app.db.database import check_postgis_available


def test_core_tables_registered():
    """Verify all 7 core tables are properly registered in SQLAlchemy metadata."""
    expected_tables = {
        "cities",
        "monitoring_locations",
        "monitoring_sensors",
        "air_quality_measurements",
        "satellite_fire_detections",
        "weather_observations",
        "environmental_hotspots",
    }
    registered_tables = set(Base.metadata.tables.keys())
    assert expected_tables.issubset(registered_tables), f"Missing tables: {expected_tables - registered_tables}"


def test_gwalior_record_in_db(db_session):
    """Verify Gwalior is properly seeded in database."""
    stmt = select(City).where(City.name == "Gwalior")
    gwalior = db_session.execute(stmt).scalar_one_or_none()
    assert gwalior is not None
    assert gwalior.name == "Gwalior"
    assert gwalior.state == "Madhya Pradesh"
    assert gwalior.country == "India"
    assert gwalior.latitude == 26.2183
    assert gwalior.longitude == 78.1828
    assert gwalior.bounding_box["min_lon"] == 78.05
    assert gwalior.is_active is True


def test_postgis_function_check(db_session):
    """Verify PostGIS verification function executes cleanly against active engine."""
    engine = db_session.get_bind()
    result = check_postgis_available(engine)
    # Returns True for PostgreSQL with PostGIS or SQLite emulation
    assert isinstance(result, bool)


def test_location_and_sensor_relationship(db_session):
    """Verify relations between City -> MonitoringLocation -> MonitoringSensor."""
    gwalior = db_session.execute(select(City).where(City.name == "Gwalior")).scalar_one()

    # Create location
    location = MonitoringLocation(
        external_location_id="test-loc-01",
        name="Phool Bagh Test Station",
        provider="OpenAQ",
        latitude=26.2150,
        longitude=78.1750,
        city_id=gwalior.id,
        country="India",
        state="Madhya Pradesh",
        is_active=True,
    )
    db_session.add(location)
    db_session.commit()
    db_session.refresh(location)

    # Create sensor
    sensor = MonitoringSensor(
        external_sensor_id="test-sensor-pm25-01",
        monitoring_location_id=location.id,
        provider="OpenAQ",
        parameter="pm25",
        unit="µg/m³",
        sensor_name="PM2.5 Laser Spectrometer",
        is_active=True,
    )
    db_session.add(sensor)
    db_session.commit()
    db_session.refresh(sensor)

    assert sensor.location.id == location.id
    assert location.city.id == gwalior.id
    assert len(location.sensors) == 1
    assert location.sensors[0].parameter == "pm25"
