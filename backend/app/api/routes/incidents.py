from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentStatusUpdateRequest,
)
from app.services.incident_service import IncidentService

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(data: IncidentCreate, db: Session = Depends(get_db)):
    """Create a new environmental incident directly."""
    return IncidentService.create_incident(db, data)


@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    origin_filter: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Retrieve all incidents with optional filtering."""
    return IncidentService.get_incidents(
        db, status=status_filter, severity=severity_filter, origin=origin_filter, limit=limit
    )


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed incident record with full multi-source evidence items and lifecycle history."""
    incident = IncidentService.get_incident_by_id(db, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{incident_id}' not found."
        )
    return incident


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
@router.post("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: str,
    req: IncidentStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    """Advance or update incident lifecycle status (detected -> verified -> investigating -> response_initiated -> resolved)."""
    try:
        return IncidentService.update_status(db, incident_id, req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

