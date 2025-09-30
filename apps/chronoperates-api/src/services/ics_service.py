import re
import tempfile
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
from icalendar import Calendar, Event
from src.config import settings


class ICSService:
    """Service for converting extracted event text to ICS format."""

    def __init__(self):
        self.calendar = None

    def _parse_extracted_text(self, extracted_text: str) -> List[Dict[str, Any]]:
        """
        Parse the structured text from Claude into event dictionaries.

        Args:
            extracted_text: The structured text response from Claude

        Returns:
            List of event dictionaries
        """
        events = []

        if "No calendar events detected" in extracted_text:
            return events

        event_blocks = extracted_text.split("EVENT:")[1:]

        for block in event_blocks:
            event_data = {}
            lines = block.strip().split("\n")

            for line in lines:
                line = line.strip()
                if ":" in line and not line.startswith("---"):
                    key, value = line.split(":", 1)
                    key = key.strip().upper()
                    value = value.strip()

                    if value and value != "Not specified":
                        event_data[key] = value

            if event_data:
                events.append(event_data)

        return events

    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """
        Parse various date formats into datetime object.

        Args:
            date_str: Date string in various formats

        Returns:
            datetime object or None if parsing fails
        """
        if not date_str:
            return None

        date_formats = [
            "%Y-%m-%d",
            "%m/%d/%Y",
            "%d/%m/%Y",
            "%m-%d-%Y",
            "%d-%m-%Y",
            "%B %d, %Y",
            "%b %d, %Y",
            "%d %B %Y",
            "%d %b %Y",
        ]

        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue

        date_match = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", date_str)
        if date_match:
            year, month, day = map(int, date_match.groups())
            return datetime(year, month, day)

        return None

    def _parse_time(self, time_str: str) -> Optional[tuple]:
        """
        Parse time string into hour and minute.

        Args:
            time_str: Time string like "14:30", "2:30 PM", etc.

        Returns:
            Tuple of (hour, minute) or None if parsing fails
        """
        if not time_str:
            return None

        time_match = re.search(r"(\d{1,2}):(\d{2})", time_str)
        if time_match:
            hour, minute = map(int, time_match.groups())

            if "PM" in time_str.upper() and hour != 12:
                hour += 12
            elif "AM" in time_str.upper() and hour == 12:
                hour = 0

            return (hour, minute)

        return None

    def _create_datetime(
        self, date_str: str, time_str: str = None
    ) -> Optional[datetime]:
        """
        Create datetime object from date and time strings.

        Args:
            date_str: Date string
            time_str: Time string (optional)

        Returns:
            datetime object or None
        """
        date_obj = self._parse_date(date_str)
        if not date_obj:
            return None

        if time_str:
            time_tuple = self._parse_time(time_str)
            if time_tuple:
                hour, minute = time_tuple
                return date_obj.replace(hour=hour, minute=minute)

        return date_obj

    def _create_ics_event(self, event_data: Dict[str, Any]) -> Event:
        """
        Create an ICS Event object from event data.

        Args:
            event_data: Dictionary with event information

        Returns:
            icalendar Event object
        """
        event = Event()

        event.add("uid", f"{datetime.now().isoformat()}@calendar-extractor")
        event.add("dtstamp", datetime.now())

        if "TITLE" in event_data:
            event.add("summary", event_data["TITLE"])
        else:
            event.add("summary", "Extracted Event")

        start_dt = None
        end_dt = None

        if "DATE" in event_data:
            if "START_TIME" in event_data:
                start_dt = self._create_datetime(
                    event_data["DATE"], event_data["START_TIME"]
                )
            else:
                start_dt = self._create_datetime(event_data["DATE"])

            if start_dt:
                event.add("dtstart", start_dt)

                if "END_TIME" in event_data:
                    end_dt = self._create_datetime(
                        event_data["DATE"], event_data["END_TIME"]
                    )
                else:
                    end_dt = start_dt + timedelta(hours=1)

                event.add("dtend", end_dt)

        if "LOCATION" in event_data:
            event.add("location", event_data["LOCATION"])

        if "DESCRIPTION" in event_data:
            event.add("description", event_data["DESCRIPTION"])

        event.add("created", datetime.now())

        return event

    def create_ics_from_text(self, extracted_text: str) -> tuple[str, int]:
        """
        Convert extracted text to ICS format.

        Args:
            extracted_text: Text extracted from Claude

        Returns:
            Tuple of (ICS content as string, number of events)
        """
        cal = Calendar()
        cal.add("prodid", settings.calendar_prodid)
        cal.add("version", settings.calendar_version)
        cal.add("calscale", "GREGORIAN")
        cal.add("method", "PUBLISH")

        events_data = self._parse_extracted_text(extracted_text)

        for event_data in events_data:
            ics_event = self._create_ics_event(event_data)
            cal.add_component(ics_event)

        ics_content = cal.to_ical().decode("utf-8")
        return ics_content, len(events_data)

    def create_ics_file_from_text(self, extracted_text: str) -> Tuple[str, Path, int]:
        """
        Convert extracted text to ICS format and save to a temporary file.

        Args:
            extracted_text: Text extracted from Claude

        Returns:
            Tuple of (ICS content as string, file path as Path, number of events)
        """
        ics_content, events_count = self.create_ics_from_text(extracted_text)

        temp_file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix='.ics',
            mode='w',
            encoding='utf-8'
        )

        try:
            temp_file.write(ics_content)
            temp_file.flush()
            file_path = Path(temp_file.name)

            return ics_content, file_path, events_count

        finally:
            temp_file.close()
