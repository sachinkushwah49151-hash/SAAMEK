"""Initial Core Environmental Tables with PostGIS and Gwalior Seed

Revision ID: 2026_09_29_0001
Revises: 
Create Date: 2026-09-29 01:00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

revision: str = "2026_09_29_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 0. Enable PostGIS extension on PostgreSQL if available
    conn = op.get_bind()
    if conn.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # 1. Cities
    op.create_table(
        "cities",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("country", sa.String(length=100), server_default="India", nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("geom", Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True),
        sa.Column("bounding_box", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_cities_name"), "cities", ["name"], unique=True)
    op.create_index(op.f("ix_cities_is_active"), "cities", ["is_active"], unique=False)

    # 2. Monitoring Locations
    op.create_table(
        "monitoring_locations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("external_location_id", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("provider", sa.String(length=100), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("geom", Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True),
        sa.Column("city_id", sa.Integer(), nullable=False),
        sa.Column("country", sa.String(length=100), server_default="India", nullable=False),
        sa.Column("state", sa.String(length=100), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider", "external_location_id", name="uq_location_provider_external_id"),
    )
    op.create_index(op.f("ix_monitoring_locations_city_id"), "monitoring_locations", ["city_id"], unique=False)
    op.create_index(op.f("ix_monitoring_locations_is_active"), "monitoring_locations", ["is_active"], unique=False)

    # 3. Monitoring Sensors
    op.create_table(
        "monitoring_sensors",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("external_sensor_id", sa.String(length=100), nullable=False),
        sa.Column("monitoring_location_id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(length=100), nullable=False),
        sa.Column("parameter", sa.String(length=50), nullable=False),
        sa.Column("unit", sa.String(length=30), nullable=False),
        sa.Column("sensor_name", sa.String(length=100), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["monitoring_location_id"], ["monitoring_locations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider", "external_sensor_id", name="uq_sensor_provider_external_id"),
    )
    op.create_index(op.f("ix_monitoring_sensors_location_id"), "monitoring_sensors", ["monitoring_location_id"], unique=False)
    op.create_index(op.f("ix_monitoring_sensors_parameter"), "monitoring_sensors", ["parameter"], unique=False)

    # 4. Air Quality Measurements
    op.create_table(
        "air_quality_measurements",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("sensor_id", sa.Integer(), nullable=True),
        sa.Column("monitoring_location_id", sa.Integer(), nullable=False),
        sa.Column("parameter", sa.String(length=50), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(length=30), nullable=False),
        sa.Column("measured_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source", sa.String(length=100), server_default="OpenAQ", nullable=False),
        sa.Column("raw_data", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["monitoring_location_id"], ["monitoring_locations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sensor_id"], ["monitoring_sensors.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_measurement_location_param_time", "air_quality_measurements", ["monitoring_location_id", "parameter", "measured_at"])
    op.create_index(op.f("ix_air_quality_measurements_measured_at"), "air_quality_measurements", ["measured_at"])

    # 5. Satellite Fire Detections
    op.create_table(
        "satellite_fire_detections",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("external_detection_id", sa.String(length=150), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("geom", Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True),
        sa.Column("detected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("satellite", sa.String(length=100), nullable=False),
        sa.Column("instrument", sa.String(length=50), server_default="VIIRS", nullable=False),
        sa.Column("confidence", sa.String(length=30), nullable=True),
        sa.Column("frp", sa.Float(), nullable=True),
        sa.Column("source", sa.String(length=100), server_default="NASA FIRMS", nullable=False),
        sa.Column("raw_data", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("external_detection_id", name="uq_fire_external_id"),
        sa.UniqueConstraint("latitude", "longitude", "detected_at", "satellite", name="uq_fire_location_time_sat"),
    )
    op.create_index("ix_fire_coords_time", "satellite_fire_detections", ["latitude", "longitude", "detected_at"])

    # 6. Weather Observations
    op.create_table(
        "weather_observations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("city_id", sa.Integer(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("geom", Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True),
        sa.Column("temperature", sa.Float(), nullable=True),
        sa.Column("humidity", sa.Float(), nullable=True),
        sa.Column("pressure", sa.Float(), nullable=True),
        sa.Column("wind_speed", sa.Float(), nullable=True),
        sa.Column("wind_direction", sa.Float(), nullable=True),
        sa.Column("weather_code", sa.Integer(), nullable=True),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source", sa.String(length=100), server_default="Open-Meteo", nullable=False),
        sa.Column("raw_data", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_weather_observations_city_id"), "weather_observations", ["city_id"])
    op.create_index(op.f("ix_weather_observations_observed_at"), "weather_observations", ["observed_at"])

    # 7. Environmental Hotspots
    op.create_table(
        "environmental_hotspots",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("city_id", sa.Integer(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("geom", Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True),
        sa.Column("radius", sa.Float(), server_default="3500.0", nullable=False),
        sa.Column("hotspot_type", sa.String(length=100), server_default="thermal_anomaly_cluster", nullable=False),
        sa.Column("source_signal_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("confidence", sa.String(length=30), nullable=True),
        sa.Column("derived_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["city_id"], ["cities.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_environmental_hotspots_city_id"), "environmental_hotspots", ["city_id"])
    op.create_index(op.f("ix_environmental_hotspots_derived_at"), "environmental_hotspots", ["derived_at"])

    # Seed Gwalior
    cities_table = sa.table(
        "cities",
        sa.column("name", sa.String),
        sa.column("state", sa.String),
        sa.column("country", sa.String),
        sa.column("latitude", sa.Float),
        sa.column("longitude", sa.Float),
        sa.column("bounding_box", sa.JSON),
        sa.column("is_active", sa.Boolean),
    )
    op.bulk_insert(
        cities_table,
        [
            {
                "name": "Gwalior",
                "state": "Madhya Pradesh",
                "country": "India",
                "latitude": 26.2183,
                "longitude": 78.1828,
                "bounding_box": {
                    "min_lon": 78.05,
                    "min_lat": 26.10,
                    "max_lon": 78.30,
                    "max_lat": 26.32,
                },
                "is_active": True,
            }
        ],
    )


def downgrade() -> None:
    op.drop_table("environmental_hotspots")
    op.drop_table("weather_observations")
    op.drop_table("satellite_fire_detections")
    op.drop_table("air_quality_measurements")
    op.drop_table("monitoring_sensors")
    op.drop_table("monitoring_locations")
    op.drop_table("cities")
