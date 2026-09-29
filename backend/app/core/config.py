import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "SAAMEK Environmental Intelligence Platform"
    API_V1_PREFIX: str = "/api"
    ENVIRONMENT: str = Field(default="development")
    LOG_LEVEL: str = Field(default="INFO")

    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/saamek"
    )

    # API Keys for ingestion (Server-side only, never returned to client)
    OPENAQ_API_KEY: str = Field(default="")
    NASA_FIRMS_API_KEY: str = Field(default="")

    # Allow local SQLite fallback for testing or standalone developer environments
    ALLOW_SQLITE_FALLBACK: bool = Field(default=True)

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
