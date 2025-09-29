import pytest
from unittest.mock import Mock, patch
import tempfile
import os
from pathlib import Path
from PIL import Image
import base64
from src.services.claude_service import ClaudeService


class TestClaudeService:
    """Test cases for the Claude service."""

    @pytest.fixture
    def claude_service(self):
        """Create Claude service instance with mocked client and disabled caching."""
        with patch('src.services.claude_service.anthropic.Anthropic') as mock_anthropic:
            service = ClaudeService()
            service.client = Mock()
            # Disable caching for tests by overriding cache methods
            service._get_from_cache = Mock(return_value=None)  # Always cache miss
            service._save_to_cache = Mock()  # No-op save
            return service

    def test_encode_image(self, claude_service, sample_image_path):
        """Test image encoding to base64."""
        # Convert string path to Path object
        path_obj = Path(sample_image_path)
        encoded = claude_service._encode_image(path_obj)

        assert isinstance(encoded, str)
        assert len(encoded) > 0

        # Verify it's valid base64
        try:
            base64.b64decode(encoded)
        except Exception:
            pytest.fail("Encoded string is not valid base64")

    def test_get_image_media_type(self, claude_service):
        """Test media type detection."""
        assert claude_service._get_image_media_type(Path("test.jpg")) == "image/jpeg"
        assert claude_service._get_image_media_type(Path("test.jpeg")) == "image/jpeg"
        assert claude_service._get_image_media_type(Path("test.png")) == "image/png"
        assert claude_service._get_image_media_type(Path("test.bmp")) == "image/bmp"
        assert claude_service._get_image_media_type(Path("test.webp")) == "image/webp"
        assert claude_service._get_image_media_type(Path("test.unknown")) == "image/jpeg"  # default

    def test_validate_image_success(self, claude_service, sample_image_path):
        """Test successful image validation."""
        path_obj = Path(sample_image_path)
        assert claude_service._validate_image(path_obj) is True

    def test_validate_image_not_found(self, claude_service):
        """Test validation with non-existent file."""
        with pytest.raises(FileNotFoundError):
            claude_service._validate_image(Path("/nonexistent/path.jpg"))

    def test_validate_image_unsupported_format(self, claude_service):
        """Test validation with unsupported format."""
        with tempfile.NamedTemporaryFile(suffix=".txt") as tmp_file:
            with pytest.raises(ValueError, match="Unsupported image format"):
                claude_service._validate_image(Path(tmp_file.name))

    def test_validate_image_too_large(self, claude_service):
        """Test validation with oversized file."""
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
            # Create a small test image first
            img = Image.new('RGB', (100, 100), color='white')
            img.save(tmp_file.name, 'JPEG')
            tmp_file.flush()

            path_obj = Path(tmp_file.name)

            # Mock the stat method at the class level
            with patch('pathlib.Path.stat') as mock_stat:
                # Create a mock stat result
                mock_stat_result = Mock()
                mock_stat_result.st_size = 20 * 1024 * 1024  # 20MB
                mock_stat.return_value = mock_stat_result

                with pytest.raises(ValueError, match="too large"):
                    claude_service._validate_image(path_obj)

        os.unlink(tmp_file.name)

    def test_validate_image_corrupted(self, claude_service):
        """Test validation with corrupted image."""
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
            tmp_file.write(b"not an image")
            tmp_file.flush()

            with pytest.raises(ValueError, match="Invalid image file"):
                claude_service._validate_image(Path(tmp_file.name))

        os.unlink(tmp_file.name)

    def test_create_extraction_prompt(self, claude_service):
        """Test prompt creation."""
        prompt = claude_service._create_extraction_prompt()

        assert isinstance(prompt, str)
        assert len(prompt) > 0
        assert "EVENT:" in prompt
        assert "TITLE:" in prompt
        assert "DATE:" in prompt
        assert "TIME:" in prompt

    def test_extract_events_from_image_success(self, claude_service, sample_image_path, mock_claude_response):
        """Test successful event extraction."""
        # Mock the Claude API response
        mock_message = Mock()
        mock_message.content = [Mock()]
        mock_message.content[0].text = mock_claude_response

        claude_service.client.messages.create = Mock(return_value=mock_message)

        # The public method is now synchronous
        result = claude_service.extract_events_from_image(sample_image_path)

        assert result == mock_claude_response
        claude_service.client.messages.create.assert_called_once()

    def test_extract_events_from_image_api_error(self, claude_service, sample_image_path):
        """Test handling of Claude API errors."""
        claude_service.client.messages.create = Mock(side_effect=Exception("API Error"))

        with pytest.raises(Exception, match="API Error"):
            claude_service.extract_events_from_image(sample_image_path)
