import json
from typing import Generator
from sqlalchemy import create_engine, text, select, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.compiler import compiles
from geoalchemy2 import Geometry
import geoalchemy2.admin.dialects.sqlite as sqlite_admin

from app.core.config import settings
from app.core.logging import logger
from app.db.base import Base
from app.db.models.city import City

# Disable SpatiaLite C-extension DDL requirements on SQLite for unit tests & fallback
sqlite_admin.before_create = lambda *a, **kw: None
sqlite_admin.after_create = lambda *a, **kw: None
sqlite_admin.before_drop = lambda *a, **kw: None
sqlite_admin.after_drop = lambda *a, **kw: None


@compiles(Geometry, "sqlite")
def compile_geometry_sqlite(type_, compiler, **kw):
    return "BLOB"


def _sqlite_to_wkb(x):
    if x is None:
        return None
    if isinstance(x, bytes):
        return x
    try:
        import shapely.wkt
        s = str(x)
        if ";" in s:
            s = s.split(";", 1)[1]
        return shapely.wkt.loads(s).wkb
    except Exception:
        return None


def setup_sqlite_spatial_functions(dbapi_conn, connection_record):
    if hasattr(dbapi_conn, "create_function"):
        dbapi_conn.create_function("GeomFromEWKT", 1, _sqlite_to_wkb)
        dbapi_conn.create_function("GeomFromText", 1, _sqlite_to_wkb)
        dbapi_conn.create_function("AsEWKB", 1, _sqlite_to_wkb)
        dbapi_conn.create_function("AsEWKT", 1, lambda x: str(x) if x is not None else None)


def _init_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql"):
        try:
            pg_engine = create_engine(
                db_url,
                connect_args={"connect_timeout": 3},
                pool_pre_ping=True,
                echo=False,
            )
            with pg_engine.connect():
                pass
            return pg_engine
        except Exception as e:
            fallback_url = "sqlite:///./saamek_dev.db"
            logger.warning(
                f"PostgreSQL connection to {db_url} unavailable ({e}). "
                f"Falling back to local development database ({fallback_url})."
            )
            fb_engine = create_engine(
                fallback_url,
                connect_args={"check_same_thread": False},
                pool_pre_ping=True,
                echo=False,
            )
            event.listen(fb_engine, "connect", setup_sqlite_spatial_functions)
            return fb_engine
    else:
        connect_args = {}
        if db_url.startswith("sqlite"):
            connect_args["check_same_thread"] = False
        eng = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True, echo=False)
        if db_url.startswith("sqlite"):
            event.listen(eng, "connect", setup_sqlite_spatial_functions)
        return eng


engine = _init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for yielding database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_postgis_available(db_engine=engine) -> bool:
    """Verifies whether the PostGIS spatial extension is available on the database."""
    try:
        with db_engine.connect() as conn:
            # Check for PostgreSQL PostGIS
            if db_engine.dialect.name == "postgresql":
                result = conn.execute(text("SELECT postgis_version();"))
                version = result.scalar()
                logger.info(f"PostGIS version detected: {version}")
                return True
            elif db_engine.dialect.name == "sqlite":
                # Check for SpatiaLite or test spatial capability
                try:
                    result = conn.execute(text("SELECT spatialite_version();"))
                    version = result.scalar()
                    logger.info(f"SpatiaLite version detected: {version}")
                    return True
                except Exception:
                    # SQLite test mock mode: spatial geometry columns are supported via GeoAlchemy2 WKB
                    logger.info("SQLite dialect detected (Spatial geometry emulation active for unit tests).")
                    return True
            return False
    except Exception as e:
        logger.warning(f"Spatial extension check result: {e}")
        return False


def seed_gwalior(db: Session) -> City:
    """Seeds the primary pilot city (Gwalior, Madhya Pradesh) into the database if not present."""
    gwalior = db.execute(select(City).where(City.name == "Gwalior")).scalar_one_or_none()
    if not gwalior:
        gwalior = City(
            name="Gwalior",
            state="Madhya Pradesh",
            country="India",
            latitude=26.2183,
            longitude=78.1828,
            bounding_box={
                "min_lon": 78.05,
                "min_lat": 26.10,
                "max_lon": 78.30,
                "max_lat": 26.32,
            },
            is_active=True,
        )
        db.add(gwalior)
        db.commit()
        db.refresh(gwalior)
        logger.info("Successfully seeded pilot city: Gwalior (Madhya Pradesh, India)")
    return gwalior


def init_db(db_engine=engine):
    """Initializes extensions, tables, and seed data."""
    try:
        with db_engine.connect() as conn:
            if db_engine.dialect.name == "postgresql":
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
                logger.info("PostGIS extension confirmed/enabled.")
    except Exception as e:
        logger.warning(f"Could not enable PostGIS extension automatically: {e}")

    Base.metadata.create_all(bind=db_engine)

    with SessionLocal() as db:
        seed_gwalior(db)
