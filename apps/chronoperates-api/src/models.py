from pydantic import BaseModel, Field
from typing import Optional


class ProcessImageRequest(BaseModel):
    """Request model for processing an image."""

    image_path: str = Field(
        ...,
        description="File system path to the image to process",
        example="/path/to/event_image.jpg",
    )


class ProcessImageResponse(BaseModel):
    """Response model for processed image."""

    ics_content: str = Field(
        ...,
        description="Generated ICS calendar content",
        example="BEGIN:VCALENDAR\nVERSION:2.0\n...",
    )
    ics_file_path: str = Field(
        ...,
        description="Path to the generated ICS file on disk",
        example="/tmp/events_abc123.ics",
    )
    extracted_text: Optional[str] = Field(
        None, description="Raw text extracted from the image by Claude"
    )
    events_found: int = Field(
        default=0, description="Number of calendar events found in the image"
    )


class ErrorResponse(BaseModel):
    """Error response model."""

    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
