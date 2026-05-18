# Backend
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    ENV: str = "development"
    SECRET_KEY: str = "change-me-to-a-64-char-random-string"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    MONGODB_URL: str = "mongodb://insureease-mongo:27017"
    MONGODB_DB_NAME: str = "insureease"

    REDIS_URL: str = "redis://insureease-redis:6379/0"

    CORS_ORIGINS: List[str] = ["http://localhost:5173","http://insureease-frontend"]

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM: str = "noreply@insureease.com"

    S3_ENDPOINT_URL: str = "http://insureease-minio:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET_NAME: str = "insureease-docs"

    RENEWAL_SCAN_CRON_HOUR: int = 8
    RENEWAL_SCAN_CRON_MINUTE: int = 0
    RENEWAL_SCAN_TIMEZONE: str = "America/Chicago"

    AI_PROVIDER: str = "none"
    AI_API_KEY: str = ""
    AI_MODEL: str = ""
    AI_BASE_URL: str = ""

settings = Settings()
