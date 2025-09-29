from pydantic_settings import BaseSettings
from typing import List, Optional
from pathlib import Path


class Settings(BaseSettings):
    """Application configuration settings."""

    # Anthropic API settings
    anthropic_api_key: Optional[str] = None
    claude_model: str
    max_tokens: int
    temperature: float

    # Image processing settings
    supported_formats: List[str] = [".jpg", ".jpeg", ".png", ".bmp", ".webp"]
    max_file_size_mb: int

    # ICS generation settings
    default_timezone: str
    calendar_prodid: str = "-//Calendar Generator//Event Extractor//EN"
    calendar_version: str = "2.0"

    # FastAPI settings
    app_title: str = "Calendar Event Extractor"
    app_description: str = "Extract calendar events from images using Claude LLM"
    app_version: str = "1.0.0"

    class Config:
        env_file = (Path(__file__).parent.parent / ".env",)
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
