from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.data_source import DataSourceHealthResponse
from app.services.data_source_service import DataSourceService

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])


@router.get("/health", response_model=List[DataSourceHealthResponse])
def get_data_sources_health(db: Session = Depends(get_db)):
    """Retrieve operational and connectivity health for all connected external and internal pipelines."""
    return DataSourceService.get_health(db)
