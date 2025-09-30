import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient


class TestMainAPI:
    """Test cases for the main FastAPI endpoints."""

    def test_health_check(self, client):
        """Test the health check endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Calendar Event Extractor API is running"}

    @patch("src.services.claude_service.ClaudeService.extract_events_from_image")
    @patch("src.services.ics_service.ICSService.create_ics_file_from_text")
    def test_process_image_success(
        self,
        mock_ics_service,
        mock_claude_service,
        client,
        sample_image_path,
        mock_claude_response,
    ):
        """Test successful image processing."""
        from pathlib import Path
        import tempfile

        # Create a temporary file for the mock response
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".ics")
        temp_file.close()
        temp_path = Path(temp_file.name)

        # Mock the services
        mock_claude_service.return_value = mock_claude_response
        mock_ics_service.return_value = (
            "BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR",
            temp_path,
            2,
        )

        response = client.post("/process_image", json={"image_path": sample_image_path})

        assert response.status_code == 200
        data = response.json()
        assert "ics_content" in data
        assert "ics_file_path" in data  # New field
        assert "extracted_text" in data
        assert "events_found" in data
        assert data["events_found"] == 2
        assert "BEGIN:VCALENDAR" in data["ics_content"]
        assert data["ics_file_path"] == str(temp_path)

        # Clean up
        temp_path.unlink(missing_ok=True)

    @patch("src.services.claude_service.ClaudeService.extract_events_from_image")
    def test_process_image_file_not_found(self, mock_extract, client):
        """Test handling of non-existent image file."""
        # Mock to raise FileNotFoundError, bypassing API key check
        mock_extract.side_effect = FileNotFoundError("Image file not found")

        response = client.post(
            "/process_image", json={"image_path": "/nonexistent/path.jpg"}
        )

        assert response.status_code == 404
        detail = response.json()["detail"].lower()
        assert "not found" in detail

    def test_process_image_invalid_format(self, client):
        """Test handling of unsupported image format."""
        import tempfile

        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as tmp_file:
            tmp_file.write(b"not an image")
            tmp_file.flush()

            response = client.post("/process_image", json={"image_path": tmp_file.name})

            assert response.status_code == 400
            assert (
                "unsupported" in response.json()["detail"].lower()
                or "invalid" in response.json()["detail"].lower()
            )

    @patch("src.services.claude_service.ClaudeService.extract_events_from_image")
    def test_process_image_claude_error(
        self, mock_claude_service, client, sample_image_path
    ):
        """Test handling of Claude API errors."""
        mock_claude_service.side_effect = Exception("Claude API error")

        response = client.post("/process_image", json={"image_path": sample_image_path})

        assert response.status_code == 500
        assert "internal server error" in response.json()["detail"].lower()

    def test_process_image_invalid_request(self, client):
        """Test handling of invalid request data."""
        response = client.post(
            "/process_image",
            json={},  # Missing image_path
        )

        assert response.status_code == 422  # Validation error
