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

from collections import defaultdict
from datetime import datetime, timezone
from difflib import SequenceMatcher
from functools import cached_property
from statistics import fmean, pvariance

import fitz
from pydantic.main import BaseModel


class ParserModel(BaseModel):
    """Object used as a response model.

    Models public properties in Parser

    Todo:
        * Add new properties to model
    """

    metadata: dict
    text: list[dict]
    toc: list


class Parser:
    """Parse PDF given document.

    Attributes:
        _doc : fitz document
    """

    _doc: fitz.Document

    # TODO: does string input need to be handled as well?
    def __init__(self, file: bytes | str):
        """Open the document.

        Args:
            file : PDF file as a buffered binary stream

        """
        self._doc = fitz.open(stream=file, filetype="pdf")
        if self._doc.needs_pass or self._doc.is_encrypted:
            raise PermissionError("No support for encrypted PDFs")

    def __enter__(self) -> Parser:
        return self

    def __exit__(self, *args):
        self.close_doc()

    def close_doc(self):
        self._doc.close()

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
            dt: datetime = datetime.strptime(date.replace("'", ""), "D:%Y%m%d%H%M%S%z")
            utc_dt = dt.replace(tzinfo=timezone.utc)
            return utc_dt.timestamp()
        except ValueError:
            raise ValueError("creationDate is empty")

    @cached_property
    def metadata(self) -> dict:
        """Document metadata.

        Returns:
            Title, author and creation timestamp

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
    def text(self) -> list[dict]:
        """Document text.

        Returns:
            Text content from entire document

        """
        text: list[dict] = []
        for page in self._doc:
            text.append(page.get_text("dict", sort=False, flags=fitz.TEXT_DEHYPHENATE))

        return text

    @cached_property
    def toc(self) -> list:
        """Document table of contents.

        Returns:
            Outline level, title, page number and link destination

        """
        return self._doc.get_toc()

    @cached_property
    def title(self) -> str:
        """Document title.

        Iterates around the first page, concatanating text chunks with large font sizes.
        If a title is in the PDF metadata, use a similarity ratio to check whether to
        use parsed_title or extracted_title.

        Returns:
            Title extracted from metadata/first page

        Notes:
            title_chunks should never be empty. Ensure that the page is not empty
            (add test).
        """
        title_chunks: dict[float, str] = defaultdict(str)
        max_font_size = fmean(self.font_sizes) + 2 * pvariance(self.font_sizes)

        # Iterating around first page blocks
        for block in self.text[0]["blocks"]:
            for line in block["lines"]:
                for span in line["spans"]:
                    text_size = span["size"]
                    if text_size > max_font_size:
                        title_chunks[text_size] += span["text"] + " "

        parsed_title = title_chunks[max(title_chunks.keys())]
        extracted_title = self.metadata["title"]

        if not extracted_title:
            return parsed_title.strip()

        # NOTE: should we trust that the pdf metadata title is correct?
        for value in title_chunks.values():
            similarity = SequenceMatcher(None, extracted_title, value).quick_ratio()
            if round(similarity, 1) == 1:
                parsed_title = extracted_title
                break

        return parsed_title.strip()

    @cached_property
    def font_sizes(self) -> list[float]:
        # TODO: refactor this function
        # it should be more generic
        font_sizes = []

        for page in self.text:
            for block in page["blocks"]:
                for line in block["lines"]:
                    for span in line["spans"]:
                        font_sizes.append(span["size"])

        return font_sizes


if __name__ == "__main__":
    with (
        open("samples/sampleScholar.pdf", "rb") as pdf,
        Parser(pdf.read()) as test,
    ):
        from pprint import pprint

        pprint(test.text[0]["blocks"][0])
        print(test.metadata)
        print(test.title)
