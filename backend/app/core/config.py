import os
from typing import List, Optional, ClassVar
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ScholarSync API"
    BACKEND_CORS_ORIGINS: List[str] = []

    # Database
    DATABASE_URL: Optional[str] = None

    # Scraping
    MAX_SCRAPING_THREADS: int = 3
    SCRAPING_USER_AGENT: str = "Mozilla/5.0 ScholarSync Bot"

    # API
    API_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def split_cors_origins(cls, v):
        if isinstance(v, str):
            # Remove brackets if present and split
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                v = v[1:-1]
            return [i.strip().strip('"').strip("'") for i in v.split(",") if i.strip()]
        return v

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
