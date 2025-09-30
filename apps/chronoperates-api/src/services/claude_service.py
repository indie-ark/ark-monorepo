import base64
import hashlib
import json
import tempfile
from pathlib import Path
from typing import Optional
from PIL import Image
import anthropic
from src.config import settings


class ClaudeService:
    """Service for interacting with Claude API to extract event information from images."""

    def __init__(self):
        if settings.anthropic_api_key:
            self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        else:
            self.client = None

        self.cache_dir = Path(tempfile.gettempdir()) / "claude_cache"
        self.cache_dir.mkdir(exist_ok=True)

    @staticmethod
    def _get_cache_key(image_path: Path, prompt: str) -> str:
        """Generate a cache key based on image content and prompt."""
        with image_path.open("rb") as f:
            image_content = f.read()

        content_hash = hashlib.md5(image_content + prompt.encode()).hexdigest()
        return content_hash

    def _get_from_cache(self, cache_key: str) -> Optional[str]:
        """Retrieve response from cache if it exists."""
        cache_file = self.cache_dir / f"{cache_key}.json"

        if cache_file.exists():
            try:
                with cache_file.open("r", encoding="utf-8") as f:
                    cache_data = json.load(f)
                return cache_data.get("response")
            except (json.JSONDecodeError, KeyError):
                # If cache file is corrupted, remove it
                cache_file.unlink(missing_ok=True)

        return None

    def _save_to_cache(self, cache_key: str, response: str) -> None:
        """Save response to cache."""
        cache_file = self.cache_dir / f"{cache_key}.json"

        cache_data = {
            "response": response,
            "timestamp": str(Path().stat().st_mtime if Path().exists() else 0)
        }

        try:
            with cache_file.open("w", encoding="utf-8") as f:
                json.dump(cache_data, f, indent=2)
        except Exception:
            # If we can't save to cache, just continue without caching
            pass

    def clear_cache(self) -> int:
        """Clear all cached responses. Returns number of files removed."""
        count = 0
        for cache_file in self.cache_dir.glob("*.json"):
            try:
                cache_file.unlink()
                count += 1
            except Exception:
                pass
        return count

    def _encode_image(self, image_path: Path) -> str:
        """Encode image to base64 string."""
        with image_path.open("rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    def _get_image_media_type(self, image_path: Path) -> str:
        """Get the media type for the image."""
        extension = image_path.suffix.lower()
        media_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp'
        }
        return media_types.get(extension, 'image/jpeg')

    def _validate_image(self, image_path: Path) -> bool:
        """Validate that the image exists and is in a supported format."""
        if not image_path.exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")

        extension = image_path.suffix.lower()
        if extension not in settings.supported_formats:
            raise ValueError(f"Unsupported image format: {extension}")

        file_size_mb = image_path.stat().st_size / (1024 * 1024)
        if file_size_mb > settings.max_file_size_mb:
            raise ValueError(f"Image file too large: {file_size_mb:.1f}MB (max: {settings.max_file_size_mb}MB)")

        try:
            with Image.open(image_path) as img:
                img.verify()
        except Exception as e:
            raise ValueError(f"Invalid image file: {str(e)}")

        return True

    def _create_extraction_prompt(self) -> str:
        """Create the prompt for Claude to extract event information."""
        return """
        Please analyze this image and extract all calendar event information you can find. Look for:
        
        - Event titles/names
        - Dates (in any format)
        - Times (start and end times)
        - Locations/venues
        - Descriptions or additional details
        - Recurring patterns if mentioned
        - Contact information
        - Any other event-related information
        
        Format your response as a structured list of events with the following information for each event:
        
        EVENT:
        TITLE: [event title]
        DATE: [date in YYYY-MM-DD format if possible, otherwise as written]
        START_TIME: [start time in HH:MM format if available]
        END_TIME: [end time in HH:MM format if available]
        LOCATION: [location/venue if mentioned]
        DESCRIPTION: [any additional details]
        ---
        
        If you cannot find specific information for a field, write "Not specified".
        If no events are found, respond with "No calendar events detected in this image."
        
        Be thorough and extract everything that could be calendar-related, even if some details are incomplete.
        """

    def extract_events_from_image(self, image_path: str) -> str:
        """
        Extract event information from an image using Claude Vision.
        Uses local caching to avoid repeat API calls during development.

        Args:
            image_path: Path to the image file (string for API compatibility)

        Returns:
            Extracted event information as text
        """
        if not self.client:
            raise ValueError("Anthropic API key not configured")

        path_obj = Path(image_path)
        self._validate_image(path_obj)
        prompt = self._create_extraction_prompt()
        cache_key = self._get_cache_key(path_obj, prompt)
        cached_response = self._get_from_cache(cache_key)

        if cached_response:
            print(f"📋 Using cached response for {path_obj.name}")
            return cached_response

        print(f"Making API call to Claude for {path_obj.name}")

        image_base64 = self._encode_image(path_obj)
        media_type = self._get_image_media_type(path_obj)

        message = self.client.messages.create(
            model=settings.claude_model,
            max_tokens=settings.max_tokens,
            temperature=settings.temperature,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_base64
                            }
                        }
                    ]
                }
            ]
        )

        response = message.content[0].text
        self._save_to_cache(cache_key, response)

        return response
