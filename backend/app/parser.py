"""Parses PDFs and provides methods to simplify content extraction.

Potentially supports other document types thanks to PyMuPDF.

Example:
    doc = Parser("doc.pdf")
    doc.text

Todo:
    * Add more methods
    * Add tests
"""

from datetime import datetime, timezone
from functools import cached_property
from typing import Union

import fitz
from pydantic.main import BaseModel


class ParserModel(BaseModel):
    """Object used as a response model.

    Models public properties in Parser
    """

    metadata: dict
    text: str
    toc: list


class Parser:
    """Parse PDF given document.

    Attributes:
        _doc (Document): fitz document
    """

    _doc: fitz.Document

    # TODO: does string input need to be handled as well?
    def __init__(self, file: Union[bytes, str]):
        """Open the document.

        Args:
            file (typing.Union[bytes, str]): PDF file as a buffered binary stream

        """
        self._doc = fitz.open(stream=file, filetype="pdf")

    @classmethod
    def __date_to_timestamp(cls, date: str) -> float:
        """Convert ISO/IEC 8824 date to UNIX timestamp.

        Args:
            date (str): ISO/IEC 8824 date

        Returns:
            float: UNIX timestamp

        Raises:
            ValueError: if `date` is empty, `datetime.strptime()` will fail

        """
        try:
            dt: datetime = datetime.strptime(date.replace("'", ""), "D:%Y%m%d%H%M%S%z")
            utc_dt = dt.replace(tzinfo=timezone.utc)
            return utc_dt.timestamp()
        except ValueError:
            raise ValueError("creationDate is empty")

    @cached_property
    def metadata(self) -> dict:
        """Document metadata.

        Returns:
            dict: Title, author and creation timestamp

        """
        metadata: dict = {}

        metadata["title"] = self._doc.metadata["title"]
        metadata["author"] = self._doc.metadata["author"]
        try:
            metadata["creationTimestamp"] = self.__date_to_timestamp(
                self._doc.metadata["creationDate"]
            )
        except ValueError:
            # Setting to an empty string is consistent with PyMuPDFs default behaviour
            metadata["creationTimestamp"] = ""

        return metadata

    @cached_property
    def text(self) -> str:
        """Document text.

        Returns:
            str: Text content from entire document

        """
        text: str = ""
        for page in self._doc:
            text += page.get_text()

        return text

    @cached_property
    def toc(self) -> list:
        """Document table of contents.

        Returns:
            list: Outline level, title, page number and link destination

        """
        return self._doc.get_toc()
