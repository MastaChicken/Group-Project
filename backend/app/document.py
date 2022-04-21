"""Handles PDF streams.

Example::

    with (open("example.pdf", "rb") as pdf, PDF(pdf.read()) as pdf):
        uid = pdf.uid

"""

from __future__ import annotations

import re
from urllib import parse
from functools import cached_property

import fitz
from fitz.fitz import EmptyFileError, FileDataError


class PDF:
    """Open and try to fix PDF document."""

    __doc: fitz.Document
    __doi_pattern = re.compile(r"\b(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?!['&\'])\S)+)\b")

    def __init__(self, file: bytes | str):
        """Open the document.

        Args:
            file : PDF file as a buffered binary stream

        Raises:
            PermissionError: if pdf is encrypted

        """
        try:
            fitz.TOOLS.mupdf_warnings()  # empty the warnings
            self.__doc = fitz.open(stream=file, filetype="pdf")
            warnings = fitz.TOOLS.mupdf_warnings()
            if warnings:
                raise RuntimeError(warnings)
        except (FileNotFoundError, FileDataError, EmptyFileError, ValueError):
            raise RuntimeError("PDF file could not be read")

        if self.__doc.needs_pass or self.__doc.is_encrypted:
            raise PermissionError("Document is encrypted")

    def __enter__(self) -> PDF:
        """Return self on enter."""
        return self

    def __exit__(self, *args):
        """Close document on exit."""
        self.close_doc()

    def close_doc(self):
        """Close document.

        Useful if not using context manager
        """
        self.__doc.close()

    @cached_property
    def uid(self) -> str | None:
        """Extract Document UID.

        Currently supports DOI.

        Checks for crossmark/dx.doi.org links on the first page. Then attempts to find
        manually using regex pattern.

        Returns:
            Document UID or None
        """
        page = self.__doc[0]
        for link in page.links(kinds=[fitz.LINK_URI]):
            parsed_uri = parse.urlparse(link["uri"])
            match parsed_uri.netloc:
                case "crossmark.crossref.org":
                    query = dict(parse.parse_qsl(parsed_uri.query))
                    if "doi" in query:
                        return query["doi"]
                case "dx.doi.org":
                    return parsed_uri.path[1:]

        # Brute force
        blocks = page.get_text("blocks")
        for block in blocks:
            # Removes newlines and spaces
            # If first character is upper case, prepend space
            lines = ""
            for line in block[4].strip().splitlines():
                stripped = line.strip()
                if stripped:
                    if stripped[0].isupper():
                        stripped = " " + stripped
                    lines += stripped
            m = self.__doi_pattern.search(lines)
            if m:
                return m.group(0)

    @property
    def bytes_(self) -> bytes:
        """MUPDF object to bytes.

        Advantage of this method is that fitz.open() can repair corrupt PDFs

        Returns:
            Original PDF
        """
        return self.__doc.tobytes()
