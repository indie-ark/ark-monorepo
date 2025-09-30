from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from pathlib import Path


class Settings(BaseSettings):
    """Application configuration settings."""

    # Anthropic API settings
    anthropic_api_key: Optional[str] = None
    claude_model: str = "claude-3-haiku-20240307"
    max_tokens: int = 1500
    temperature: float = 0.1

    # Image processing settings
    supported_formats: List[str] = [".jpg", ".jpeg", ".png", ".bmp", ".webp"]
    max_file_size_mb: int = 10

    # ICS generation settings
    default_timezone: str = "UTC"
    calendar_prodid: str = "-//Calendar Generator//Event Extractor//EN"
    calendar_version: str = "2.0"

    # FastAPI settings
    app_title: str = "Calendar Event Extractor"
    app_description: str = "Extract calendar events from images using Claude LLM"
    app_version: str = "1.0.0"
    port: int = 8000
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent / ".env"),
        env_file_encoding="utf-8",
    )


# Global settings instance
settings = Settings()
