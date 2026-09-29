import random
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload
from geoalchemy2.elements import WKTElement

from app.db.models.incident import Incident
from app.db.models.incident_evidence import IncidentEvidence
from app.db.models.incident_status_history import IncidentStatusHistory
from app.db.models.citizen_report import CitizenReport
from app.db.models.weather import WeatherObservation
from app.db.models.measurement import AirQualityMeasurement
from app.schemas.incident import IncidentCreate, IncidentStatusUpdateRequest


class IncidentService:
    VALID_STATUSES = ["detected", "verified", "investigating", "response_initiated", "resolved"]

    @staticmethod
    def create_incident(db: Session, data: IncidentCreate) -> Incident:

        year = datetime.now().year
        rand_suffix = random.randint(1000, 9999)
        inc_id = f"INC-GWL-{year}-{rand_suffix}"
        while db.execute(select(Incident.id).where(Incident.incident_id == inc_id)).first():
            rand_suffix = random.randint(1000, 9999)
            inc_id = f"INC-GWL-{year}-{rand_suffix}"

        geom = WKTElement(f"POINT({data.longitude} {data.latitude})", srid=4326)

        incident = Incident(
            incident_id=inc_id,
            title=data.title,
            incident_type=data.incident_type,
            severity=data.severity,
            status=data.status,
            confidence=data.confidence,
            origin=data.origin,
            description=data.description,
            latitude=data.latitude,
            longitude=data.longitude,
            geom=geom,
            location_name=data.location_name,
            affected_area=data.affected_area,
            affected_radius_meters=data.affected_radius_meters,
            assigned_officer=data.assigned_officer or "Gwalior Municipal Control Room",
            citizen_report_id=data.citizen_report_id,
            is_test_data=data.is_test_data,
            wind_speed=data.wind_speed,
            wind_direction=data.wind_direction,
            wind_cardinal=data.wind_cardinal,
            potential_impact_area=data.potential_impact_area,
            pm25_value=data.pm25_value,
            pm10_value=data.pm10_value,
            nearest_station_name=data.nearest_station_name,
        )
        db.add(incident)
        db.flush()

        # Add initial evidence items if supplied
        if data.evidence_items:
            for ev in data.evidence_items:
                ev_item = IncidentEvidence(
                    incident_id=incident.id,
                    evidence_type=ev.evidence_type,
                    title=ev.title,
                    description=ev.description,
                    value_text=ev.value_text,
                    is_supporting=ev.is_supporting,
                    source=ev.source,
                )
                db.add(ev_item)

        # Initial Status History
        history_entry = IncidentStatusHistory(
            incident_id=incident.id,
            previous_status=None,
            new_status=data.status,
            changed_by=data.assigned_officer or "System Ingestion",
            notes=f"Incident registered via {data.origin.replace('_', ' ')}",
        )
        db.add(history_entry)

        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def get_incidents(
        db: Session,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        origin: Optional[str] = None,
        limit: int = 100,
    ) -> List[Incident]:
        stmt = (
            select(Incident)
            .options(
                selectinload(Incident.evidence_items),
                selectinload(Incident.status_history),
            )
            .order_by(Incident.detected_at.desc())
        )
        if status:
            stmt = stmt.where(Incident.status == status)
        if severity:
            stmt = stmt.where(Incident.severity == severity)
        if origin:
            stmt = stmt.where(Incident.origin == origin)
        stmt = stmt.limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def get_incident_by_id(db: Session, incident_id: str) -> Optional[Incident]:
        stmt = (
            select(Incident)
            .options(
                selectinload(Incident.evidence_items),
                selectinload(Incident.status_history),
            )
            .where(
                (Incident.incident_id == incident_id)
                | (Incident.id == int(incident_id) if incident_id.isdigit() else False)
            )
        )
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def update_status(
        db: Session, incident_id: str, req: IncidentStatusUpdateRequest
    ) -> Incident:
        incident = IncidentService.get_incident_by_id(db, incident_id)
        if not incident:
            raise ValueError(f"Incident '{incident_id}' not found.")

        if req.new_status not in IncidentService.VALID_STATUSES:
            raise ValueError(
                f"Invalid status '{req.new_status}'. Allowed: {IncidentService.VALID_STATUSES}"
            )

        prev = incident.status
        incident.status = req.new_status
        incident.updated_at = datetime.now(timezone.utc)

        # Append status change history
        history_entry = IncidentStatusHistory(
            incident_id=incident.id,
            previous_status=prev,
            new_status=req.new_status,
            changed_by=req.changed_by,
            notes=req.notes or f"Status transitioned from {prev} to {req.new_status}",
        )
        db.add(history_entry)

        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def seed_initial_operational_data_if_empty(db: Session) -> None:
        """Seed a clean baseline of Gwalior incidents and reports for initial demonstration if not already present."""
        try:
            # 1. Baseline Citizen Report 1 (Converted to Incident 2)
            cr1 = db.execute(select(CitizenReport).where(CitizenReport.report_id == "CR-GWL-2026-0001")).scalar_one_or_none()
            if not cr1:
                cr1 = CitizenReport(
                    report_id="CR-GWL-2026-0001",
                    report_type="garbage_burning",
                    title="Open solid waste burning along North-East bypass boundary wall",
                    description="Thick toxic smoke rising from accumulated municipal dump near bypass wall. Visibility reduced on main road.",
                    latitude=26.259242,
                    longitude=78.216432,
                    geom=WKTElement("POINT(78.216432 26.259242)", srid=4326),
                    location_name="Deen Dayal Nagar Bypass, Gwalior, Madhya Pradesh, India",
                    status="converted_to_incident",
                    citizen_name="Amitabh Saxena",
                    citizen_contact="+91 94251 XXXXX",
                    verification_notes="Verified by Officer V. K. Saxena after correlating with elevated NO2 readings at Deen Dayal Nagar monitoring station.",
                    verified_by="officer.env@nic.in",
                    converted_incident_id="INC-GWL-2026-0002",
                )
                db.add(cr1)
                db.flush()

            # 2. Baseline Citizen Report 2 (Pending Verification)
            cr2 = db.execute(select(CitizenReport).where(CitizenReport.report_id == "CR-GWL-2026-0002")).scalar_one_or_none()
            if not cr2:
                cr2 = CitizenReport(
                    report_id="CR-GWL-2026-0002",
                    report_type="smoke_burning",
                    title="Thick black smoke near City Center flyover construction",
                    description="Dense smoke visible rising from behind the commercial complex near City Center flyover. Strong chemical odor.",
                    latitude=26.2085,
                    longitude=78.1880,
                    geom=WKTElement("POINT(78.1880 26.2085)", srid=4326),
                    location_name="City Center Flyover, Gwalior, Madhya Pradesh, India",
                    status="pending_verification",
                    citizen_name="Sunil Agrawal",
                    citizen_contact="+91 98260 XXXXX",
                )
                db.add(cr2)
                db.flush()

            # 3. Incident 1: Air Quality Spurt at Industrial Corridor
            inc1 = db.execute(select(Incident).where(Incident.incident_id == "INC-GWL-2026-0001")).scalar_one_or_none()
            if not inc1:
                inc1 = Incident(
                    incident_id="INC-GWL-2026-0001",
                    title="Sustained PM2.5 Spike — Maharaj Bada Commercial Basin",
                    incident_type="air_pollution_spike",
                    severity="high",
                    status="investigating",
                    confidence="high",
                    origin="aqi_spike",
                    description="Continuous sensor readings at Maharaj Bada station indicated sudden particulate concentration surge exceeding standard threshold.",
                    latitude=26.200388,
                    longitude=78.147714,
                    geom=WKTElement("POINT(78.147714 26.200388)", srid=4326),
                    location_name="Maharaj Bada, Gwalior, Madhya Pradesh, India",
                    affected_area="Lashkar & Maharaj Bada Commercial Zone",
                    affected_radius_meters=1500,
                    assigned_officer="Insp. Rajesh Sharma (MPPCB Zone 1)",
                    wind_speed=8.5,
                    wind_direction=299.0,
                    wind_cardinal="WNW",
                    potential_impact_area="Downwind towards Morar & City Center",
                    pm25_value=124.0,
                    pm10_value=195.0,
                    nearest_station_name="Maharaj Bada, Gwalior - MPPCB",
                    is_test_data=False,
                )
                db.add(inc1)
                db.flush()

                db.add(IncidentEvidence(
                    incident_id=inc1.id,
                    evidence_type="aq_spike",
                    title="PM2.5 Rapid Escalation (2.8x Baseline)",
                    description="Continuous monitoring sensor registered PM2.5 increase from 42 µg/m³ to 124 µg/m³ within 45 minutes.",
                    value_text="124.0 µg/m³ (Baseline: 42 µg/m³)",
                    is_supporting=True,
                    source="OpenAQ",
                ))
                db.add(IncidentEvidence(
                    incident_id=inc1.id,
                    evidence_type="wind_trajectory",
                    title="Wind Dispersion Vector (WNW @ 8.5 km/h)",
                    description="Prevailing westerly wind channeling particulate plume through inner ring commercial corridor.",
                    value_text="8.5 km/h @ 299°",
                    is_supporting=True,
                    source="Open-Meteo",
                ))
                db.add(IncidentEvidence(
                    incident_id=inc1.id,
                    evidence_type="satellite_thermal",
                    title="Orbital Thermal Anomaly Verification",
                    description="VIIRS thermal sensor pass detected no active agricultural fire cluster in immediately adjacent fields.",
                    value_text="0 Thermal Anomalies",
                    is_supporting=False,
                    source="NASA FIRMS",
                ))

                db.add(IncidentStatusHistory(
                    incident_id=inc1.id,
                    previous_status=None,
                    new_status="detected",
                    changed_by="Automated Anomaly Engine",
                    notes="Threshold anomaly triggered from Maharaj Bada station telemetry",
                ))
                db.add(IncidentStatusHistory(
                    incident_id=inc1.id,
                    previous_status="detected",
                    new_status="verified",
                    changed_by="Control Officer Verma",
                    notes="Verified sensor calibration and matched with traffic surge report",
                ))
                db.add(IncidentStatusHistory(
                    incident_id=inc1.id,
                    previous_status="verified",
                    new_status="investigating",
                    changed_by="Insp. Rajesh Sharma",
                    notes="Field patrol dispatched to inspect vehicular bottleneck and DG set usage",
                ))

            # 4. Incident 2: Potential Open-Burning Event
            inc2 = db.execute(select(Incident).where(Incident.incident_id == "INC-GWL-2026-0002")).scalar_one_or_none()
            if not inc2:
                inc2 = Incident(
                    incident_id="INC-GWL-2026-0002",
                    title="Open-Burning & Municipal Waste Hotspot — Deen Dayal Nagar",
                    incident_type="potential_open_burning",
                    severity="medium",
                    status="response_initiated",
                    confidence="high",
                    origin="citizen_report",
                    description="Citizen visual reports and high NO2 haze observed near Deen Dayal Nagar periphery.",
                    latitude=26.259242,
                    longitude=78.216432,
                    geom=WKTElement("POINT(78.216432 26.259242)", srid=4326),
                    location_name="Deen Dayal Nagar, Gwalior, Madhya Pradesh, India",
                    affected_area="North-East Industrial Bypass & Deen Dayal Nagar",
                    affected_radius_meters=2000,
                    assigned_officer="Officer V. K. Saxena (Municipal Flying Squad)",
                    wind_speed=7.2,
                    wind_direction=275.0,
                    wind_cardinal="W",
                    potential_impact_area="Downwind towards Maharajpur Airbase",
                    pm25_value=98.0,
                    pm10_value=162.0,
                    nearest_station_name="Deen Dayal Nagar, Gwalior - MPPCB",
                    citizen_report_id="CR-GWL-2026-0001",
                    is_test_data=False,
                )
                db.add(inc2)
                db.flush()

                db.add(IncidentEvidence(
                    incident_id=inc2.id,
                    evidence_type="citizen_report",
                    title="Citizen Visual Report #CR-GWL-2026-0001",
                    description="Citizen submitted photographic evidence of solid waste burning near bypass boundary wall.",
                    value_text="Photographic Evidence Attached",
                    is_supporting=True,
                    source="Citizen Report",
                ))
                db.add(IncidentEvidence(
                    incident_id=inc2.id,
                    evidence_type="aq_spike",
                    title="Elevated Localized NO2 & PM10",
                    description="Deen Dayal Nagar station recorded NO2 of 64.3 ppb and PM10 of 162 µg/m³.",
                    value_text="64.3 ppb NO2, 162 µg/m³ PM10",
                    is_supporting=True,
                    source="OpenAQ",
                ))

                db.add(IncidentStatusHistory(
                    incident_id=inc2.id,
                    previous_status=None,
                    new_status="detected",
                    changed_by="Citizen Triage Unit",
                    notes="Derived from citizen report submission",
                ))
                db.add(IncidentStatusHistory(
                    incident_id=inc2.id,
                    previous_status="detected",
                    new_status="verified",
                    changed_by="Officer V. K. Saxena",
                    notes="Confirmed waste dumping location along bypass",
                ))
                db.add(IncidentStatusHistory(
                    incident_id=inc2.id,
                    previous_status="verified",
                    new_status="investigating",
                    changed_by="Officer V. K. Saxena",
                    notes="Patrol unit sent to scene",
                ))
                db.add(IncidentStatusHistory(
                    incident_id=inc2.id,
                    previous_status="investigating",
                    new_status="response_initiated",
                    changed_by="Officer V. K. Saxena",
                    notes="Water tanker and municipal sanitation enforcement unit deployed to extinguish and clear dump",
                ))

            db.commit()
        except Exception as e:
            db.rollback()
            # Silently log, do not crash lifespan
            print(f"[SEED] Operational baseline initialization encountered: {e}")
