from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import tempfile
from pathlib import Path
from src.config import settings
from src.models import ProcessImageRequest, ProcessImageResponse, ErrorResponse
from src.services.claude_service import ClaudeService
from src.services.ics_service import ICSService


app = FastAPI(
    title=settings.app_title,
    description=settings.app_description,
    version=settings.app_version,
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],  # Vite dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

claude_service = ClaudeService()
ics_service = ICSService()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Calendar Event Extractor API is running"}


@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file and extract calendar events, returning ICS content and file path.

    Args:
        file: Uploaded image file

    Returns:
        ProcessImageResponse with ICS content, file path, and metadata
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, detail="File must be an image (JPEG, PNG, BMP, WebP)"
            )

        # Create temporary file to save uploaded image
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=Path(file.filename or "image").suffix
        ) as tmp_file:
            # Read and save uploaded file
            content = await file.read()
            tmp_file.write(content)
            tmp_file.flush()

            temp_image_path = tmp_file.name

        try:
            # Extract events from image using Claude
            extracted_text = claude_service.extract_events_from_image(temp_image_path)

            # Convert to ICS format and create file
            ics_content, ics_file_path, events_count = (
                ics_service.create_ics_file_from_text(extracted_text)
            )

            return ProcessImageResponse(
                ics_content=ics_content,
                ics_file_path=str(ics_file_path),
                extracted_text=extracted_text,
                events_found=events_count,
            )

        finally:
            # Clean up temporary image file
            Path(temp_image_path).unlink(missing_ok=True)

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Image file not found: {str(e)}")

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/download-ics")
async def download_ics(file_path: str):
    """
    Download an ICS file by file path.

    Args:
        file_path: Path to the ICS file

    Returns:
        FileResponse with the ICS file
    """
    try:
        ics_path = Path(file_path)
        if not ics_path.exists():
            raise HTTPException(status_code=404, detail="ICS file not found")

        return FileResponse(
            path=str(ics_path),
            media_type="text/calendar",
            filename="calendar_events.ics",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")


# Keep the original endpoint for backward compatibility
@app.post(
    "/process_image",
    response_model=ProcessImageResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        404: {"model": ErrorResponse, "description": "File Not Found"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"},
    },
)
async def process_image(request: ProcessImageRequest):
    """
    Extract calendar events from an image and return them in ICS format.

    Args:
        request: Request containing the image path

    Returns:
        ProcessImageResponse with ICS content, file path, and metadata
    """
    try:
        # Extract events from image using Claude (synchronous call)
        extracted_text = claude_service.extract_events_from_image(request.image_path)

        # Convert to ICS format and create file
        ics_content, ics_file_path, events_count = (
            ics_service.create_ics_file_from_text(extracted_text)
        )

        return ProcessImageResponse(
            ics_content=ics_content,
            ics_file_path=str(
                ics_file_path
            ),  # Convert Path to string for JSON serialization
            extracted_text=extracted_text,
            events_found=events_count,
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Image file not found: {str(e)}")

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""
    return JSONResponse(
        status_code=500, content={"error": "Internal server error", "detail": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
