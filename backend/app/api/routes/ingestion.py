"""Ingestion routes for running manual synchronization pipelines."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.core.exceptions import CityNotFoundError
from app.db.database import get_db
from app.schemas.environment import GwaliorSyncResponse
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/ingestion", tags=["Ingestion"])


def get_ingestion_service() -> IngestionService:
    return IngestionService()


@router.post(
    "/gwalior/sync",
    response_model=GwaliorSyncResponse,
    status_code=status.HTTP_200_OK,
    summary="Trigger live ingestion pipeline for Gwalior pilot city",
    description="Synchronizes live OpenAQ ambient air quality stations, NASA FIRMS VIIRS satellite thermal detections, and Open-Meteo meteorological telemetry for Gwalior.",
)
def sync_gwalior_data(
    db: Session = Depends(get_db),
    ingestion_service: IngestionService = Depends(get_ingestion_service),
):
    try:
        result = ingestion_service.sync_gwalior(db)
        return result
    except CityNotFoundError as e:
        logger.error(f"Sync failed - city not found: {e}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.exception(f"Unhandled error during Gwalior sync: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion pipeline failure: {str(e)}",
        )
