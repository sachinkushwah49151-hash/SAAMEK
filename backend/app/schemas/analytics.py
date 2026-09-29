from typing import Dict, List, Any
from pydantic import BaseModel


class AnalyticsSummaryResponse(BaseModel):
    active_incidents_count: int
    high_critical_incidents_count: int
    pending_verification_reports_count: int
    total_citizen_reports_count: int
    anomalies_count: int
    resolved_incidents_count: int
    data_sources_healthy_count: int
    total_data_sources_count: int
    incidents_by_type: Dict[str, int]
    incidents_by_status: Dict[str, int]
    incidents_by_severity: Dict[str, int]
    reports_by_type: Dict[str, int]
    incidents_by_area: Dict[str, int]
