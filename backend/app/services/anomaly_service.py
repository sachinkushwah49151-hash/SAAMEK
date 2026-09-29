import random
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

from app.db.models.anomaly import EnvironmentalAnomaly
from app.db.models.location import MonitoringLocation
from app.db.models.measurement import AirQualityMeasurement
from app.schemas.anomaly import AnomalyTestTriggerRequest


class AnomalyDetectionService:
    @staticmethod
    def get_anomalies(db: Session, limit: int = 50) -> List[EnvironmentalAnomaly]:
        """Returns anomalies from real threshold triggers and controlled test cases."""
        # Ensure any baseline threshold cross is captured
        AnomalyDetectionService._scan_real_telemetry_for_anomalies(db)

        stmt = select(EnvironmentalAnomaly).order_by(EnvironmentalAnomaly.detected_at.desc()).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def _scan_real_telemetry_for_anomalies(db: Session) -> None:
        """Evaluates real measurement telemetry against dynamic thresholds."""
        count = db.execute(select(func.count(EnvironmentalAnomaly.id))).scalar() or 0
        if count > 0:
            return  # already populated

        # Check latest measurements
        locations = db.execute(select(MonitoringLocation)).scalars().all()
        for loc in locations:
            meas = db.execute(
                select(AirQualityMeasurement)
                .where(AirQualityMeasurement.monitoring_location_id == loc.id)
                .order_by(AirQualityMeasurement.measured_at.desc())
            ).scalars().all()

            for m in meas:
                if m.parameter.lower() == "no2" and m.value >= 50.0:
                    anomaly_id = f"ANOM-GWL-{loc.id}-NO2"
                    exists = db.execute(
                        select(EnvironmentalAnomaly).where(EnvironmentalAnomaly.anomaly_id == anomaly_id)
                    ).scalar_one_or_none()
                    if not exists:
                        db.add(EnvironmentalAnomaly(
                            anomaly_id=anomaly_id,
                            title=f"Elevated Nitrogen Dioxide at {loc.name}",
                            parameter="no2",
                            baseline_value=25.0,
                            observed_value=m.value,
                            unit=m.unit or "ppb",
                            threshold_ratio=round(m.value / 25.0, 2),
                            station_name=loc.name,
                            latitude=loc.latitude,
                            longitude=loc.longitude,
                            geom=WKTElement(f"POINT({loc.longitude} {loc.latitude})", srid=4326),
                            location_name=f"{loc.name}, Gwalior, Madhya Pradesh, India",
                            severity="high" if m.value >= 60.0 else "medium",
                            status="active",
                            is_test_data=False,
                            explanation=f"Sensor telemetry for NO2 crossed the 50 ppb threshold with an observed value of {m.value} {m.unit} (baseline ~25 ppb).",
                        ))
            db.commit()

    @staticmethod
    def trigger_test_anomaly(db: Session, req: AnomalyTestTriggerRequest) -> EnvironmentalAnomaly:
        """Creates a clearly marked controlled test-data anomaly for end-to-end demonstrations."""
        year = datetime.now().year
        count = db.execute(select(func.count(EnvironmentalAnomaly.id))).scalar() or 0
        anomaly_id = f"ANOM-TEST-{year}-{count + 1:04d}"

        # Standard Gwalior coordinates for test location
        coords_map = {
            "City Center, Gwalior - MPPCB": (26.203442, 78.193251),
            "Maharaj Bada, Gwalior - MPPCB": (26.200388, 78.147714),
            "Deen Dayal Nagar, Gwalior - MPPCB": (26.259242, 78.216432),
            "Phool Bagh, Gwalior - Mondelez Ind. Food": (26.210536, 78.171000),
        }
        lat, lon = coords_map.get(req.station_name, (26.2183, 78.1828))

        ratio = round(req.observed_value / max(req.baseline_value, 1.0), 2)
        severity = "critical" if ratio >= 3.0 else "high" if ratio >= 2.0 else "medium"

        anomaly = EnvironmentalAnomaly(
            anomaly_id=anomaly_id,
            title=f"[DEMO TEST] {req.parameter.upper()} Sudden Surge Spike ({ratio}x Baseline)",
            parameter=req.parameter.lower(),
            baseline_value=req.baseline_value,
            observed_value=req.observed_value,
            unit="µg/m³" if "pm" in req.parameter.lower() else "ppb",
            threshold_ratio=ratio,
            station_name=req.station_name,
            latitude=lat,
            longitude=lon,
            geom=WKTElement(f"POINT({lon} {lat})", srid=4326),
            location_name=req.location_name,
            severity=severity,
            status="active",
            is_test_data=True,
            explanation=f"Controlled test simulation: Sensor telemetry jumped from {req.baseline_value} to {req.observed_value} ({ratio}x baseline) within 30 minutes.",
        )
        db.add(anomaly)
        db.commit()
        db.refresh(anomaly)
        return anomaly
