from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db, check_postgis_available
from app.core.logging import logger

router = APIRouter(tags=["Health"])


@router.get("/health", status_code=status.HTTP_200_OK)
def get_health():
    """Basic health check endpoint returning status ok."""
    return {"status": "ok"}


@router.get("/health/details", status_code=status.HTTP_200_OK)
def get_health_details(db: Session = Depends(get_db)):
    """Comprehensive diagnostic health check verifying database and PostGIS spatial capabilities."""
    db_connected = False
    try:
        db.execute(text("SELECT 1;"))
        db_connected = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")

    postgis_ok = check_postgis_available(db.get_bind())

    return {
        "status": "ok" if db_connected else "degraded",
        "database_connected": db_connected,
        "spatial_postgis_available": postgis_ok,
    }
