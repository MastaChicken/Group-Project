"""Parses PDFs and provides methods to simplify content extraction.

Potentially supports other document types thanks to PyMuPDF.

Example::

    with (open("example.pdf", "rb") as pdf, Parser(pdf.read()) as doc):
        metadata = doc.metadata

Todo:
    * Add more methods
    * Add tests
    * Multiprocessing
"""

from __future__ import annotations

from datetime import datetime, timezone
from difflib import SequenceMatcher
from functools import cached_property
from statistics import StatisticsError, fmean

import fitz


class Parser:
    """Parse PDF given document.

    Attributes:
        __doc : fitz document
    """

    __doc: fitz.Document

    # TODO: does string input need to be handled as well?
    def __init__(self, file: bytes | str):
        """Open the document.

        Args:
            file : PDF file as a buffered binary stream

        Raises:
            PermissionError: if pdf is encrypted

        """
        self.__doc = fitz.open(stream=file, filetype="pdf")
        if self.__doc.needs_pass or self.__doc.is_encrypted:
            raise PermissionError("No support for encrypted PDFs")

    def __enter__(self) -> Parser:
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

    def __date_to_timestamp(self, date: str) -> float:
        """Convert ISO/IEC 8824 date to UNIX timestamp.

        Args:
            date : ISO/IEC 8824 date

        Returns:
            UNIX timestamp

        Raises:
            ValueError: if `date` is empty, `datetime.strptime()` will fail

        """
        try:
            # Sanitize for strptime
            if "'" not in date:
                date += "+0000"
            else:
                date = date.replace("'", "")
            dt: datetime = datetime.strptime(date, "D:%Y%m%d%H%M%S%z")
            utc_dt = dt.replace(tzinfo=timezone.utc)
            return utc_dt.timestamp()
        except ValueError:
            raise ValueError("creationDate is empty")

    @cached_property
    def metadata(self) -> dict[str, str]:
        """Document metadata.

        Returns:
            Title, author and creation timestamp

        """
        metadata: dict = {}

        metadata["title"] = self.__doc.metadata["title"]
        metadata["author"] = self.__doc.metadata["author"]
        try:
            metadata["creationTimestamp"] = self.__date_to_timestamp(
                self.__doc.metadata["creationDate"]
            )
        except ValueError:
            # Setting to an empty string is consistent with PyMuPDFs default behaviour
            metadata["creationTimestamp"] = ""

        return metadata

    @cached_property
    def text(self) -> list[dict]:
        """Document text.

        Returns:
            Text content from entire document

        """
        text: list[dict] = []
        for page in self.__doc:
            text.append(page.get_text("dict", sort=False))

        return text

    @cached_property
    def toc(self) -> list:
        """Document table of contents.

        Returns:
            Outline level, title, page number and link destination

        """
        return self.__doc.get_toc()

    @cached_property
    def title(self) -> str:
        """Document title.

        Iterates around the first page, concatanating text chunks with large font sizes.
        Ignores text chunks with one words or less.
        If a title is in the PDF metadata, use a similarity ratio to check whether to
        use parsed_title or metadata_title.

        Returns:
            Title extracted from first page/metadata
        """
        title_chunks: dict[float, str] = {}
        spans = self.spans.get(0, [])

        # Get average font size of first page
        try:
            avg_font_size = fmean([span["size"] for span in spans])
        except StatisticsError:
            avg_font_size = 0.0

        for span in spans:
            text_size = span["size"]
            if avg_font_size and text_size >= avg_font_size:
                # TODO: improve the insertion of whitespace
                if text_size not in title_chunks:
                    title_chunks[text_size] = str(span["text"])
                    continue
                title_chunks[text_size] += " " + str(span["text"])

        # Attempt to get title (more than 1 word) with largest font
        parsed_title = ""
        title_chunks_max = 0.0
        for key in title_chunks.keys():
            if key > title_chunks_max and len(title_chunks[key].split()) > 1:
                title_chunks_max = key

        if title_chunks_max != 0.0:
            parsed_title = title_chunks[title_chunks_max]

        metadata_title = self.metadata["title"]
        if not metadata_title or metadata_title == "untitled":
            return " ".join(parsed_title.split())

        for value in title_chunks.values():
            value = value.strip()
            similarity = SequenceMatcher(None, metadata_title, value).quick_ratio()
            if round(similarity, 1) == 1:
                parsed_title = metadata_title
                break

        if not parsed_title:
            parsed_title = metadata_title

        return " ".join(parsed_title.split())

    @cached_property
    def spans(self) -> dict[int, list]:
        """Text spans per page.

        Zero-based
        """
        spans: dict[int, list] = {}

        for i, page in enumerate(self.text):
            spans[i] = []
            for block in page["blocks"]:
                if "lines" not in block:
                    continue
                for line in block["lines"]:
                    for span in line["spans"]:
                        spans[i].append(span)

        return spans


if __name__ == "__main__":
    import os

    for file in os.listdir("samples"):
        if not file.endswith(".pdf"):
            continue
        with (
            open(os.path.join("samples", file), "rb") as pdf,
            Parser(pdf.read()) as test,
        ):
            print(
                f"{file}:\n  parsed:{test.title}\n  metadata:{test.metadata['title']}\n"
            )
