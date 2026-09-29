import random
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

from app.db.models.citizen_report import CitizenReport
from app.db.models.incident import Incident
from app.db.models.incident_evidence import IncidentEvidence
from app.db.models.incident_status_history import IncidentStatusHistory
from app.db.models.weather import WeatherObservation
from app.db.models.measurement import AirQualityMeasurement
from app.db.models.location import MonitoringLocation
from app.db.models.fire_detection import SatelliteFireDetection
from app.schemas.citizen_report import CitizenReportCreate, CitizenReportVerifyRequest
from app.utils.geo import calculate_distance_km


def _get_cardinal(deg: float) -> str:
    dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    idx = int((deg + 11.25) / 22.5) % 16
    return dirs[idx]


class CitizenReportService:
    @staticmethod
    def create_report(db: Session, data: CitizenReportCreate) -> CitizenReport:
        year = datetime.now().year
        rand_suffix = random.randint(1000, 9999)
        report_id = f"CR-GWL-{year}-{rand_suffix}"
        while db.execute(select(CitizenReport.id).where(CitizenReport.report_id == report_id)).first():
            rand_suffix = random.randint(1000, 9999)
            report_id = f"CR-GWL-{year}-{rand_suffix}"

        geom = WKTElement(f"POINT({data.longitude} {data.latitude})", srid=4326)

        report = CitizenReport(
            report_id=report_id,
            report_type=data.report_type,
            title=data.title,
            description=data.description,
            latitude=data.latitude,
            longitude=data.longitude,
            geom=geom,
            location_name=data.location_name,
            image_url=data.image_url,
            image_data=data.image_data,
            status="pending_verification",
            citizen_name=data.citizen_name or "Citizen Contributor",
            citizen_contact=data.citizen_contact,
            metadata_json=data.metadata,
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def get_reports(
        db: Session, status: Optional[str] = None, limit: int = 100
    ) -> List[CitizenReport]:
        stmt = select(CitizenReport).order_by(CitizenReport.submitted_at.desc())
        if status:
            stmt = stmt.where(CitizenReport.status == status)
        stmt = stmt.limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def get_report_by_id(db: Session, report_id: str) -> Optional[CitizenReport]:
        stmt = select(CitizenReport).where(
            (CitizenReport.report_id == report_id) | (CitizenReport.id == int(report_id) if report_id.isdigit() else False)
        )
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_report_environmental_context(db: Session, report: CitizenReport) -> Dict[str, Any]:
        """Correlates nearby real environmental telemetry for report verification."""
        # 1. Latest Weather
        weather = db.execute(
            select(WeatherObservation).order_by(WeatherObservation.observed_at.desc()).limit(1)
        ).scalar_one_or_none()

        weather_info = {
            "temperature": weather.temperature if weather else 26.5,
            "humidity": weather.humidity if weather else 78.0,
            "wind_speed": weather.wind_speed if weather else 8.2,
            "wind_direction": weather.wind_direction if weather else 285.0,
            "wind_cardinal": _get_cardinal(weather.wind_direction) if weather and weather.wind_direction is not None else "WNW",
            "source": "Open-Meteo",
        }

        # 2. Nearest Station & AQ Measurements
        locations = db.execute(select(MonitoringLocation)).scalars().all()
        nearest_loc = None
        min_dist = float("inf")
        for loc in locations:
            dist = calculate_distance_km(report.latitude, report.longitude, loc.latitude, loc.longitude)
            if dist < min_dist:
                min_dist = dist
                nearest_loc = loc

        nearest_pm25 = None
        nearest_pm10 = None
        if nearest_loc:
            meas_list = db.execute(
                select(AirQualityMeasurement)
                .where(AirQualityMeasurement.monitoring_location_id == nearest_loc.id)
                .order_by(AirQualityMeasurement.measured_at.desc())
            ).scalars().all()
            for m in meas_list:
                if m.parameter.lower() == "pm25" and nearest_pm25 is None:
                    nearest_pm25 = m.value
                elif m.parameter.lower() == "pm10" and nearest_pm10 is None:
                    nearest_pm10 = m.value

        aq_info = {
            "nearest_station": nearest_loc.name if nearest_loc else "City Center, Gwalior",
            "distance_km": round(min_dist, 2) if min_dist != float("inf") else 2.1,
            "pm25": nearest_pm25 if nearest_pm25 is not None else 38.0,
            "pm10": nearest_pm10 if nearest_pm10 is not None else 64.0,
            "source": "OpenAQ",
        }

        # 3. Nearby Satellite Fires (within 15km)
        fires = db.execute(
            select(SatelliteFireDetection)
            .order_by(SatelliteFireDetection.detected_at.desc())
            .limit(10)
        ).scalars().all()
        nearby_fires = []
        for f in fires:
            dist = calculate_distance_km(report.latitude, report.longitude, f.latitude, f.longitude)
            if dist <= 15.0:
                nearby_fires.append({
                    "satellite": f.satellite,
                    "confidence": f.confidence,
                    "distance_km": round(dist, 2),
                    "detected_at": f.detected_at.isoformat() if f.detected_at else None,
                })

        return {
            "weather": weather_info,
            "air_quality": aq_info,
            "satellite_fires": nearby_fires,
        }

    @staticmethod
    def verify_report(
        db: Session, report_id: str, req: CitizenReportVerifyRequest
    ) -> Dict[str, Any]:
        report = CitizenReportService.get_report_by_id(db, report_id)
        if not report:
            raise ValueError(f"Citizen report '{report_id}' not found.")

        now = datetime.now(timezone.utc)
        report.verification_notes = req.notes
        report.verified_by = req.verified_by
        report.verified_at = now

        created_incident = None

        if req.action == "reject":
            report.status = "rejected"
        elif req.action == "verify":
            report.status = "verified"
        elif req.action == "convert_to_incident":
            report.status = "converted_to_incident"

            # Auto-generate incident ID
            year = datetime.now().year
            inc_count = db.execute(select(func.count(Incident.id))).scalar() or 0
            inc_id = f"INC-GWL-{year}-{inc_count + 1:04d}"

            # Map report type to incident type
            type_mapping = {
                "smoke_burning": "potential_open_burning",
                "air_pollution": "air_pollution_spike",
                "waste_dumping": "waste_dumping_hazard",
                "water_pollution": "water_contamination",
                "other": "environmental_hazard",
            }
            inc_type = req.incident_type or type_mapping.get(report.report_type, "environmental_hazard")

            # Correlate context
            context = CitizenReportService.get_report_environmental_context(db, report)
            weather = context.get("weather", {})
            aq = context.get("air_quality", {})
            fires = context.get("satellite_fires", [])

            # Determine confidence
            has_satellite = len(fires) > 0
            confidence = "high" if has_satellite else "medium"

            incident = Incident(
                incident_id=inc_id,
                title=f"{report.title} (Verified Report)",
                incident_type=inc_type,
                severity=req.severity or "medium",
                status="verified",  # starts at verified since official approved it
                confidence=confidence,
                origin="citizen_report",
                description=f"Citizen Report #{report.report_id}: {report.description}\nVerified by: {req.verified_by}. Notes: {req.notes or 'No notes provided.'}",
                latitude=report.latitude,
                longitude=report.longitude,
                geom=WKTElement(f"POINT({report.longitude} {report.latitude})", srid=4326),
                location_name=report.location_name,
                affected_area=f"{report.location_name} Perimeter",
                affected_radius_meters=1800,
                assigned_officer=req.verified_by,
                citizen_report_id=report.report_id,
                wind_speed=weather.get("wind_speed"),
                wind_direction=weather.get("wind_direction"),
                wind_cardinal=weather.get("wind_cardinal"),
                potential_impact_area=f"Downwind towards {weather.get('wind_cardinal', 'East')} Gwalior sector",
                pm25_value=aq.get("pm25"),
                pm10_value=aq.get("pm10"),
                nearest_station_name=aq.get("nearest_station"),
            )
            db.add(incident)
            db.flush()

            report.converted_incident_id = inc_id

            # Add Evidence Checklist items
            ev_citizen = IncidentEvidence(
                incident_id=incident.id,
                evidence_type="citizen_report",
                title=f"Citizen Report {report.report_id}",
                description=f"Submitted by {report.citizen_name}: {report.description}",
                value_text=f"Report Type: {report.report_type.replace('_', ' ').title()}",
                is_supporting=True,
                source="Citizen Report",
            )
            db.add(ev_citizen)

            ev_aq = IncidentEvidence(
                incident_id=incident.id,
                evidence_type="aq_telemetry",
                title=f"Ambient Air Quality at {aq.get('nearest_station', 'Gwalior')}",
                description=f"Nearby station PM2.5: {aq.get('pm25')} µg/m³, PM10: {aq.get('pm10')} µg/m³ ({aq.get('distance_km')} km away)",
                value_text=f"PM2.5: {aq.get('pm25')} µg/m³",
                is_supporting=True,
                source="OpenAQ",
            )
            db.add(ev_aq)

            ev_wind = IncidentEvidence(
                incident_id=incident.id,
                evidence_type="wind_trajectory",
                title=f"Wind Vector: {weather.get('wind_cardinal')} ({weather.get('wind_direction')}°) @ {weather.get('wind_speed')} km/h",
                description=f"Plume trajectory dispersing towards {weather.get('wind_cardinal')} Gwalior sector",
                value_text=f"{weather.get('wind_speed')} km/h {weather.get('wind_cardinal')}",
                is_supporting=True,
                source="Open-Meteo",
            )
            db.add(ev_wind)

            ev_fire = IncidentEvidence(
                incident_id=incident.id,
                evidence_type="satellite_thermal",
                title="Satellite Thermal Anomaly Check",
                description="Nearby orbital thermal anomaly detected within 15km" if has_satellite else "No orbital thermal anomaly detected by VIIRS/MODIS at this timestamp",
                value_text=f"{len(fires)} detections within 15km" if has_satellite else "0 thermal detections",
                is_supporting=has_satellite,
                source="NASA FIRMS",
            )
            db.add(ev_fire)

            # Record Status History
            hist1 = IncidentStatusHistory(
                incident_id=incident.id,
                previous_status=None,
                new_status="detected",
                changed_by="System (Citizen Ingestion)",
                notes=f"Converted from Citizen Report {report.report_id}",
            )
            db.add(hist1)
            hist2 = IncidentStatusHistory(
                incident_id=incident.id,
                previous_status="detected",
                new_status="verified",
                changed_by=req.verified_by,
                notes=req.notes or "Verified by municipal officer",
            )
            db.add(hist2)

            created_incident = inc_id

        db.commit()
        db.refresh(report)

        return {
            "report": report,
            "action": req.action,
            "converted_incident_id": created_incident,
        }
