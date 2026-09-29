from app.api.routes.health import router as health_router
from app.api.routes.cities import router as cities_router
from app.api.routes.ingestion import router as ingestion_router
from app.api.routes.environment import router as environment_router
from app.api.routes.citizen_reports import router as citizen_reports_router
from app.api.routes.incidents import router as incidents_router
from app.api.routes.anomalies import router as anomalies_router
from app.api.routes.data_sources import router as data_sources_router
from app.api.routes.analytics import router as analytics_router

__all__ = [
    "health_router",
    "cities_router",
    "ingestion_router",
    "environment_router",
    "citizen_reports_router",
    "incidents_router",
    "anomalies_router",
    "data_sources_router",
    "analytics_router",
]
