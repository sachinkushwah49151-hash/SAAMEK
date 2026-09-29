from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.anomaly import EnvironmentalAnomalyResponse, AnomalyTestTriggerRequest
from app.services.anomaly_service import AnomalyDetectionService

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])


@router.get("", response_model=List[EnvironmentalAnomalyResponse])
def get_anomalies(limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve detected environmental anomalies."""
    return AnomalyDetectionService.get_anomalies(db, limit=limit)


@router.post("/trigger-test", response_model=EnvironmentalAnomalyResponse, status_code=status.HTTP_201_CREATED)
def trigger_test_anomaly(req: AnomalyTestTriggerRequest, db: Session = Depends(get_db)):
    """Controlled test-data mechanism allowing end-to-end workflow demonstration without faking live data."""
    return AnomalyDetectionService.trigger_test_anomaly(db, req)
