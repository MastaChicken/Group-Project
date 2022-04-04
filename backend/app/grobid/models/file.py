# noqa: D100
from typing import BinaryIO, TextIO

# TODO: use pydantic dataclass or BaseModel when pydantic is updated to v1.9
from dataclasses import dataclass


@dataclass
class File:
    """Represents the PDF file used as input."""

    payload: bytes
    file_name: str | None = None
    mime_type: str | None = None

    def to_tuple(self) -> tuple[str | None, bytes, str | None]:
        """Return a tuple for httpx mutlipart/form-data encoding."""
        return self.file_name, self.payload, self.mime_type
