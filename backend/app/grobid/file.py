# noqa: D100
from typing import BinaryIO, TextIO


class File:
    """Represents the PDF file used as input."""

    __payload: BinaryIO | TextIO
    __file_name: str | None
    __mime_type: str | None

    def __init__(  # noqa: D107
        self,
        payload: BinaryIO | TextIO,
        file_name: str = None,
        mime_type: str = None,
    ) -> None:
        self.__payload = payload
        self.__file_name = file_name
        self.__mime_type = mime_type

    def to_tuple(self) -> tuple[str | None, BinaryIO | TextIO, str | None]:
        """Return a tuple for httpx mutlipart/form-data encoding."""
        return self.__file_name, self.__payload, self.__mime_type
