import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from httpx import AsyncClient
from fastapi.testclient import TestClient
import tempfile
import os
from PIL import Image


# Test configuration
@pytest.fixture
def test_settings():
    """Override settings for testing."""
    with patch("src.config.settings") as mock_settings:
        mock_settings.anthropic_api_key = "test-key"
        mock_settings.claude_model = "claude-3-sonnet-20240229"
        mock_settings.max_tokens = 1000
        mock_settings.temperature = 0.1
        mock_settings.supported_formats = [".jpg", ".jpeg", ".png"]
        mock_settings.max_file_size_mb = 10
        mock_settings.app_title = "Test Calendar Extractor"
        mock_settings.app_description = "Test API"
        mock_settings.app_version = "1.0.0"
        yield mock_settings


@pytest.fixture
def sample_image_path():
    """Create a temporary test image."""
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
        # Create a simple test image
        img = Image.new("RGB", (100, 100), color="white")
        img.save(tmp_file.name, "JPEG")
        yield tmp_file.name
    # Cleanup
    os.unlink(tmp_file.name)


@pytest.fixture
def mock_claude_response():
    """Mock Claude API response."""
    return """
EVENT:
TITLE: Team Meeting
DATE: 2024-03-15
START_TIME: 10:00
END_TIME: 11:00
LOCATION: Conference Room A
DESCRIPTION: Weekly team sync meeting
---

EVENT:
TITLE: Project Deadline
DATE: 2024-03-20
START_TIME: 17:00
END_TIME: 18:00
LOCATION: Not specified
DESCRIPTION: Final project submission
---
"""


@pytest.fixture
def app():
    """Create FastAPI test app."""
    from src.main import app

    return app


@pytest.fixture
def client(app):
    """Create test client."""
    return TestClient(app)
