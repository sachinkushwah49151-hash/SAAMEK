from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.db.database import init_db, engine, SessionLocal, check_postgis_available
from app.services.incident_service import IncidentService
from app.api.routes import (
    health_router,
    cities_router,
    ingestion_router,
    environment_router,
    citizen_reports_router,
    incidents_router,
    anomalies_router,
    data_sources_router,
    analytics_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for FastAPI startup and graceful shutdown."""
    logger.info("Initializing SAAMEK Environmental Incident Intelligence Platform...")
    try:
        init_db(engine)
        postgis_ok = check_postgis_available(engine)
        logger.info(f"Database readiness verified (Spatial PostGIS: {'AVAILABLE' if postgis_ok else 'STANDBY'}).")
        
        # Seed default starting operational baseline if clean
        with SessionLocal() as db:
            IncidentService.seed_initial_operational_data_if_empty(db)
    except Exception as e:
        logger.warning(
            f"Database initialization encountered an alert: {e}."
        )

    yield

    logger.info("Shutting down SAAMEK Backend...")
    engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for SAAMEK Environmental Incident Intelligence & Response Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(cities_router, prefix=settings.API_V1_PREFIX)
app.include_router(ingestion_router, prefix=settings.API_V1_PREFIX)
app.include_router(environment_router, prefix=settings.API_V1_PREFIX)
app.include_router(citizen_reports_router, prefix=settings.API_V1_PREFIX)
app.include_router(incidents_router, prefix=settings.API_V1_PREFIX)
app.include_router(anomalies_router, prefix=settings.API_V1_PREFIX)
app.include_router(data_sources_router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "purpose": "Environmental Incident Intelligence & Response Platform",
        "workflow": "DETECT -> CORRELATE -> ASSESS -> RESPOND -> RESOLVE",
        "status": "operational",
        "health_endpoint": f"{settings.API_V1_PREFIX}/health",
        "documentation": "/docs",
    }
