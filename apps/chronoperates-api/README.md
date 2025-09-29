# Calendar Event Extractor API

A FastAPI backend that extracts calendar events from images using Claude LLM and returns them in ICS format.

## Features

- **Single Endpoint**: `/process_image` - Processes an image and extracts calendar events
- **Claude Integration**: Uses Anthropic's Claude API with vision capabilities to analyze images
- **ICS Generation**: Converts extracted event data to standard ICS calendar format
- **Comprehensive Testing**: Full test suite with 25+ tests covering all functionality
- **Type Safety**: Pydantic models for request/response validation
- **Error Handling**: Proper error responses for various failure scenarios

## Project Structure

```
src/
├── main.py              # FastAPI application
├── models.py            # Pydantic request/response models
├── config.py            # Configuration management
└── services/
    ├── claude_service.py    # Claude API integration
    └── ics_service.py       # ICS calendar generation
tests/
├── conftest.py          # Test fixtures and configuration
├── test_main.py         # API endpoint tests
└── services/
    ├── test_claude_service.py  # Claude service tests
    └── test_ics_service.py     # ICS service tests
```

## API Endpoints

### Health Check
```
GET /
```
Returns API status information.

### Process Image
```
POST /process_image
```

**Request Body:**
```json
{
  "image_path": "/path/to/your/image.jpg"
}
```

**Response:**
```json
{
  "ics_content": "BEGIN:VCALENDAR\nVERSION:2.0\n...",
  "extracted_text": "Raw text extracted by Claude",
  "events_found": 2
}
```

## Setup

### 1. Install Dependencies
```bash
uv sync
```

### 2. Configuration
Copy `.env.example` to `.env` and add your Anthropic API key:
```bash
cp .env.example .env
```

Edit `.env`:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Run the Server
```bash
# Development server
PYTHONPATH=. uv run python src/main.py

# Or with uvicorn directly
PYTHONPATH=. uv run uvicorn src.main:app --reload
```

The API will be available at `http://localhost:8000`

### 4. API Documentation
FastAPI automatically generates interactive documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Docker

You can build and run the API using Docker.

### Build the Docker image

```bash
docker build -t chronoperates-api .
```

### Run the Docker container

```bash
# Using a .env file for configuration
docker run --rm -p 8000:8000 --env-file .env chronoperates-api

# Or set environment variables directly
docker run --rm -p 8000:8000 -e ANTHROPIC_API_KEY=your_key -e CLAUDE_MODEL=claude-3-sonnet-20240229 chronoperates-api
```

The API will be available at [http://localhost:8000](http://localhost:8000).

## Testing

Run the complete test suite:
```bash
PYTHONPATH=. uv run python -m pytest tests/ -v
```

Run specific test categories:
```bash
# Test Claude service only
PYTHONPATH=. uv run python -m pytest tests/services/test_claude_service.py -v

# Test ICS service only
PYTHONPATH=. uv run python -m pytest tests/services/test_ics_service.py -v

# Test API endpoints only
PYTHONPATH=. uv run python -m pytest tests/test_main.py -v
```

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- BMP (.bmp)
- WebP (.webp)

## Configuration Options

All configuration can be set via environment variables:

- `ANTHROPIC_API_KEY`: Your Anthropic API key (required)
- `CLAUDE_MODEL`: Claude model to use (default: claude-3-sonnet-20240229)
- `MAX_TOKENS`: Maximum tokens for Claude response (default: 1500)
- `TEMPERATURE`: Claude temperature setting (default: 0.1)
- `MAX_FILE_SIZE_MB`: Maximum image file size in MB (default: 10)

## Event Extraction

The system extracts the following event information:
- Event titles/names
- Dates (various formats supported)
- Start and end times
- Locations/venues
- Descriptions
- Contact information

## ICS Format

The generated ICS files include:
- Standard VCALENDAR structure
- VEVENT components for each extracted event
- Proper date/time formatting
- Event metadata (UID, timestamps, etc.)

## Error Handling

The API provides appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid image, missing API key, etc.)
- `422`: Validation error (missing required fields)
- `500`: Internal server error

## Future Enhancements

- File upload support (currently accepts file paths)
- Downloadable ICS file responses
- Batch processing for multiple images
- Support for recurring events
- Enhanced date/time parsing
- Integration with calendar services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License.