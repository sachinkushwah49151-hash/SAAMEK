from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.citizen_report import (
    CitizenReportCreate,
    CitizenReportResponse,
    CitizenReportVerifyRequest,
)
from app.services.citizen_report_service import CitizenReportService

router = APIRouter(prefix="/citizen-reports", tags=["Citizen Reports"])


@router.post("", response_model=CitizenReportResponse, status_code=status.HTTP_201_CREATED)
def submit_report(data: CitizenReportCreate, db: Session = Depends(get_db)):
    """Citizens submit an environmental observation report."""
    return CitizenReportService.create_report(db, data)


@router.get("", response_model=List[CitizenReportResponse])
def get_reports(
    status_filter: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Retrieve citizen reports, optionally filtered by status (pending_verification, verified, rejected)."""
    return CitizenReportService.get_reports(db, status=status_filter, limit=limit)


@router.get("/{report_id}", response_model=Dict[str, Any])
def get_report_detail(report_id: str, db: Session = Depends(get_db)):
    """Retrieve report detail along with correlated nearby environmental context (AQ, Weather, Satellite)."""
    report = CitizenReportService.get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Report '{report_id}' not found.")
    context = CitizenReportService.get_report_environmental_context(db, report)
    return {
        "report": CitizenReportResponse.model_validate(report),
        "environmental_context": context,
    }


@router.post("/{report_id}/verify")
def verify_report(
    report_id: str,
    req: CitizenReportVerifyRequest,
    db: Session = Depends(get_db),
):
    """Government official triage: verify, reject, or convert to official incident."""
    try:
        res = CitizenReportService.verify_report(db, report_id, req)
        return {
            "status": "success",
            "action": res["action"],
            "report_id": report_id,
            "report_status": res["report"].status,
            "converted_incident_id": res["converted_incident_id"],
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
