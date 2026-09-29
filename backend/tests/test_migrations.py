import os
from pathlib import Path
from alembic.config import Config
from alembic import command

BASE_DIR = Path(__file__).resolve().parent.parent


def test_alembic_upgrade_and_downgrade():
    """Verify Alembic migration up and migration down lifecycle."""
    test_db_path = BASE_DIR / "test_migration_lifecycle.db"
    if test_db_path.exists():
        test_db_path.unlink()

    alembic_ini_path = str(BASE_DIR / "alembic.ini")
    alembic_cfg = Config(alembic_ini_path)
    alembic_cfg.set_main_option("script_location", str(BASE_DIR / "app" / "db" / "migrations"))
    alembic_cfg.set_main_option("sqlalchemy.url", f"sqlite:///{test_db_path}")

    # 1. Run migration UP
    command.upgrade(alembic_cfg, "head")

    # 2. Run migration DOWN
    command.downgrade(alembic_cfg, "base")

    # Cleanup
    if test_db_path.exists():
        try:
            test_db_path.unlink()
        except Exception:
            pass
