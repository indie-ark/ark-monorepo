import pytest
from datetime import datetime
from src.services.ics_service import ICSService


class TestICSService:
    """Test cases for the ICS service."""

    @pytest.fixture
    def ics_service(self):
        """Create ICS service instance."""
        return ICSService()

    def test_parse_extracted_text_with_events(self, ics_service, mock_claude_response):
        """Test parsing of structured event text."""
        events = ics_service._parse_extracted_text(mock_claude_response)

        assert len(events) == 2

        # Check first event
        assert events[0]["TITLE"] == "Team Meeting"
        assert events[0]["DATE"] == "2024-03-15"
        assert events[0]["START_TIME"] == "10:00"
        assert events[0]["END_TIME"] == "11:00"
        assert events[0]["LOCATION"] == "Conference Room A"
        assert events[0]["DESCRIPTION"] == "Weekly team sync meeting"

        # Check second event
        assert events[1]["TITLE"] == "Project Deadline"
        assert events[1]["DATE"] == "2024-03-20"
        assert events[1]["START_TIME"] == "17:00"
        assert events[1]["END_TIME"] == "18:00"
        assert events[1]["DESCRIPTION"] == "Final project submission"
        assert "LOCATION" not in events[1]  # "Not specified" should be filtered out

    def test_parse_extracted_text_no_events(self, ics_service):
        """Test parsing when no events are found."""
        text = "No calendar events detected in this image."
        events = ics_service._parse_extracted_text(text)

        assert len(events) == 0

    def test_parse_date_various_formats(self, ics_service):
        """Test date parsing with various formats."""
        test_cases = [
            ("2024-03-15", datetime(2024, 3, 15)),
            ("03/15/2024", datetime(2024, 3, 15)),
            ("15/03/2024", datetime(2024, 3, 15)),
            ("March 15, 2024", datetime(2024, 3, 15)),
            ("Mar 15, 2024", datetime(2024, 3, 15)),
            ("15 March 2024", datetime(2024, 3, 15)),
            ("invalid-date", None),
        ]

        for date_str, expected in test_cases:
            result = ics_service._parse_date(date_str)
            if expected:
                assert result.date() == expected.date()
            else:
                assert result is None

    def test_parse_time_various_formats(self, ics_service):
        """Test time parsing with various formats."""
        test_cases = [
            ("14:30", (14, 30)),
            ("2:30 PM", (14, 30)),
            ("2:30 AM", (2, 30)),
            ("12:00 PM", (12, 0)),
            ("12:00 AM", (0, 0)),
            ("invalid-time", None),
        ]

        for time_str, expected in test_cases:
            result = ics_service._parse_time(time_str)
            assert result == expected

    def test_create_datetime(self, ics_service):
        """Test datetime creation from date and time strings."""
        # With time
        dt = ics_service._create_datetime("2024-03-15", "14:30")
        assert dt == datetime(2024, 3, 15, 14, 30)

        # Without time
        dt = ics_service._create_datetime("2024-03-15")
        assert dt == datetime(2024, 3, 15)

        # Invalid date
        dt = ics_service._create_datetime("invalid-date")
        assert dt is None

    def test_create_ics_event(self, ics_service):
        """Test ICS event creation."""
        event_data = {
            "TITLE": "Test Event",
            "DATE": "2024-03-15",
            "START_TIME": "10:00",
            "END_TIME": "11:00",
            "LOCATION": "Test Location",
            "DESCRIPTION": "Test Description",
        }

        event = ics_service._create_ics_event(event_data)

        assert str(event.get("summary")) == "Test Event"
        assert str(event.get("location")) == "Test Location"
        assert str(event.get("description")) == "Test Description"
        assert event.get("dtstart") is not None
        assert event.get("dtend") is not None
        assert event.get("uid") is not None

    def test_create_ics_event_minimal_data(self, ics_service):
        """Test ICS event creation with minimal data."""
        event_data = {"TITLE": "Minimal Event"}

        event = ics_service._create_ics_event(event_data)

        assert str(event.get("summary")) == "Minimal Event"
        assert event.get("uid") is not None
        assert event.get("dtstamp") is not None

    def test_create_ics_from_text_with_events(self, ics_service, mock_claude_response):
        """Test complete ICS creation from text."""
        ics_content, event_count = ics_service.create_ics_from_text(
            mock_claude_response
        )

        assert event_count == 2
        assert isinstance(ics_content, str)
        assert "BEGIN:VCALENDAR" in ics_content
        assert "END:VCALENDAR" in ics_content
        assert "BEGIN:VEVENT" in ics_content
        assert "END:VEVENT" in ics_content
        assert "Team Meeting" in ics_content
        assert "Project Deadline" in ics_content

    def test_create_ics_from_text_no_events(self, ics_service):
        """Test ICS creation when no events are found."""
        text = "No calendar events detected in this image."
        ics_content, event_count = ics_service.create_ics_from_text(text)

        assert event_count == 0
        assert isinstance(ics_content, str)
        assert "BEGIN:VCALENDAR" in ics_content
        assert "END:VCALENDAR" in ics_content
        assert "BEGIN:VEVENT" not in ics_content

