import os
import sys
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.compiler import compiles
from geoalchemy2 import Geometry
import geoalchemy2.admin.dialects.sqlite as sqlite_admin

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Use SQLite database for isolated unit testing
TEST_DATABASE_URL = "sqlite:///./test_saamek.db"
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

# Disable SpatiaLite C-extension DDL requirements on SQLite for unit tests
sqlite_admin.before_create = lambda *a, **kw: None
sqlite_admin.after_create = lambda *a, **kw: None
sqlite_admin.before_drop = lambda *a, **kw: None
sqlite_admin.after_drop = lambda *a, **kw: None


@compiles(Geometry, "sqlite")
def compile_geometry_sqlite(type_, compiler, **kw):
    return "BLOB"


from app.core.config import settings
from app.db.base import Base
from app.db.database import get_db, init_db, seed_gwalior
from app.main import app

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)


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


@event.listens_for(test_engine, "connect")
def setup_sqlite_spatial_functions(dbapi_conn, connection_record):
    if hasattr(dbapi_conn, "create_function"):
        dbapi_conn.create_function("GeomFromEWKT", 1, _sqlite_to_wkb)
        dbapi_conn.create_function("GeomFromText", 1, _sqlite_to_wkb)
        dbapi_conn.create_function("AsEWKB", 1, _sqlite_to_wkb)
        dbapi_conn.create_function("AsEWKT", 1, lambda x: str(x) if x is not None else None)


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Initializes the database schema and seeds Gwalior for test runs."""
    Base.metadata.create_all(bind=test_engine)
    with TestingSessionLocal() as db:
        seed_gwalior(db)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_saamek.db"):
        try:
            os.remove("./test_saamek.db")
        except Exception:
            pass


@pytest.fixture
def db_session():
    """Yields a clean database session per test."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def clean_tables(db_session):
    """Clean all dynamic telemetry tables between tests to ensure test isolation."""
    for table in reversed(Base.metadata.sorted_tables):
        if table.name != "cities":
            db_session.execute(table.delete())
    db_session.commit()
    yield


@pytest.fixture
def client(db_session):
    """Provides a TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
