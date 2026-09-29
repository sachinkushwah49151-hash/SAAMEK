from typing import Dict, Any
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.models.incident import Incident
from app.db.models.citizen_report import CitizenReport
from app.db.models.anomaly import EnvironmentalAnomaly
from app.services.data_source_service import DataSourceService


class AnalyticsService:
    @staticmethod
    def get_summary(db: Session) -> Dict[str, Any]:
        """Calculates accurate operational metrics from stored database records."""
        # Active Incidents (not resolved)
        active_incidents_count = db.execute(
            select(func.count(Incident.id)).where(Incident.status != "resolved")
        ).scalar() or 0

        # High / Critical Incidents
        high_critical_incidents_count = db.execute(
            select(func.count(Incident.id)).where(
                Incident.status != "resolved",
                Incident.severity.in_(["high", "critical"])
            )
        ).scalar() or 0

        # Resolved Incidents
        resolved_incidents_count = db.execute(
            select(func.count(Incident.id)).where(Incident.status == "resolved")
        ).scalar() or 0

        # Pending Citizen Reports
        pending_reports_count = db.execute(
            select(func.count(CitizenReport.id)).where(CitizenReport.status == "pending_verification")
        ).scalar() or 0

        # Total Citizen Reports
        total_reports_count = db.execute(
            select(func.count(CitizenReport.id))
        ).scalar() or 0

        # Anomalies count
        anomalies_count = db.execute(
            select(func.count(EnvironmentalAnomaly.id)).where(EnvironmentalAnomaly.status == "active")
        ).scalar() or 0

        # Incidents by Type
        type_rows = db.execute(
            select(Incident.incident_type, func.count(Incident.id)).group_by(Incident.incident_type)
        ).all()
        incidents_by_type = {row[0]: row[1] for row in type_rows}

        # Incidents by Status
        status_rows = db.execute(
            select(Incident.status, func.count(Incident.id)).group_by(Incident.status)
        ).all()
        incidents_by_status = {row[0]: row[1] for row in status_rows}

        # Incidents by Severity
        sev_rows = db.execute(
            select(Incident.severity, func.count(Incident.id)).group_by(Incident.severity)
        ).all()
        incidents_by_severity = {row[0]: row[1] for row in sev_rows}

        # Citizen Reports by Type
        cr_type_rows = db.execute(
            select(CitizenReport.report_type, func.count(CitizenReport.id)).group_by(CitizenReport.report_type)
        ).all()
        reports_by_type = {row[0]: row[1] for row in cr_type_rows}

        # Incidents by Area
        area_rows = db.execute(
            select(Incident.affected_area, func.count(Incident.id)).group_by(Incident.affected_area).limit(10)
        ).all()
        incidents_by_area = {row[0]: row[1] for row in area_rows}

        # Data sources health
        sources = DataSourceService.get_health(db)
        healthy_count = sum(1 for s in sources if s["status"] in ["connected", "available"])

        return {
            "active_incidents_count": active_incidents_count,
            "high_critical_incidents_count": high_critical_incidents_count,
            "pending_verification_reports_count": pending_reports_count,
            "total_citizen_reports_count": total_reports_count,
            "anomalies_count": anomalies_count,
            "resolved_incidents_count": resolved_incidents_count,
            "data_sources_healthy_count": healthy_count,
            "total_data_sources_count": len(sources),
            "incidents_by_type": incidents_by_type,
            "incidents_by_status": incidents_by_status,
            "incidents_by_severity": incidents_by_severity,
            "reports_by_type": reports_by_type,
            "incidents_by_area": incidents_by_area,
        }
