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
    __preserve_images: bool
    __possible_ligatures: set[str] = {"ff", "fi", "fl", "ffi", "ffl", "ft", "st"}

    # TODO: does string input need to be handled as well?
    def __init__(self, file: bytes | str, preserve_images: bool = False):
        """Open the document.

        Args:
            file : PDF file as a buffered binary stream

        Raises:
            PermissionError: if pdf is encrypted

        """
        self.__doc = fitz.open(stream=file, filetype="pdf")
        self.__preserve_images = preserve_images
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

    @staticmethod
    def date_to_timestamp(date: str) -> float:
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
            metadata["creationTimestamp"] = self.date_to_timestamp(
                self.__doc.metadata["creationDate"]
            )
        except ValueError:
            # Setting to an empty string is consistent with PyMuPDFs default behaviour
            metadata["creationTimestamp"] = ""

        return metadata

    @cached_property
    def pages(self) -> dict[int, dict]:
        """Document pages.

        Returns:
            Text spans from entire document

        """
        text: dict[int, dict] = {}
        flags = (
            fitz.TEXT_PRESERVE_WHITESPACE
            | fitz.TEXT_MEDIABOX_CLIP
            | fitz.TEXT_DEHYPHENATE
        )
        if self.__preserve_images:
            flags = flags | fitz.TEXT_PRESERVE_IMAGES

        for page in self.__doc:
            text[page.number] = page.get_text(
                "dict",
                sort=False,
                flags=flags,
            )

        return text

    @cached_property
    def bounds(self) -> dict[int, tuple[float, float]]:
        """Document page bounds.

        Returns:
            Page bounds within 10% for top and bottom margins
        """
        bounds: dict[int, tuple[float, float]] = {}

        for i in range(self.__doc.page_count):
            rect = self.__doc[i].rect
            y1 = rect.y1
            bounds[i] = (y1 * 0.1, y1 * 0.9)

        return bounds

    @cached_property
    def toc(self) -> list:
        """Document table of contents.

        Returns:
            Outline level, title, page number and link destination

        """
        return self.__doc.get_toc(simple=False)

    # @cached_property
    # def simple_toc(self) -> dict[int, list]:
    #     """Document self-correcting ToC."""
    #     simple_toc: dict[int, list] = {}

    #     for i in range(self.__doc.page_count):
    #         simple_toc[i] = []

    #     for toc in self.toc:
    #         to = self.__doc[toc[2] - 1].search_for(toc[1])
    #         if len(to) == 1:
    #             x_center = (to[0].x0 + to[0].x1) / 2
    #             y_center = (to[0].y0 + to[0].y1) / 2
    #             to = fitz.Point(x_center, y_center)
    #         else:
    #             to = toc[3]["to"]
    #         simple = dict(title=toc[1], to=to)
    #         simple_toc[toc[2] - 1].append(simple)

    #     return simple_toc

    @cached_property
    def sections(self) -> dict:
        """Document sections per heading.

        Returns:
            Dictionary of
        """
        # TODO: improve spacing between fullstop, since it can mess-up the sentencizer
        # TODO: what about tables? :(
        # TODO: consider missing toc
        tocs = [x[1].lower().strip() for x in self.toc]
        # TODO: split TOC by page
        # TODO: use ToC element point rather than text to match
        # TODO: remove incomplete sentences
        # tocs = [x[1] for x in self.toc]

        current_heading = ""
        origin_pos = None
        origin_page = 0
        sentence_delimitters = {".", "?", "!", ","}
        is_ligature = False
        s = {}
        for page_no, spans in self.spans.items():
            try:
                # TODO: this might be filtering important data like tables
                avg_font_size = fmean([span["size"] for span in spans])
            except StatisticsError:
                avg_font_size = 0.0
            for span in spans:
                if span["text"].lower().strip() in tocs:
                    origin_pos = span["origin"]
                    origin_page = page_no + 1
                    current_heading = span["text"]
                elif (
                    current_heading != ""
                    and span["size"] >= avg_font_size
                    and origin_pos
                    and (
                        origin_pos[1] <= span["origin"][1] or origin_page < page_no + 1
                    )
                    and (
                        span["origin"][1] > self.bounds[page_no][0]
                        and span["origin"][1] < self.bounds[page_no][1]
                    )
                ):
                    text = span["text"]
                    stripped_text = text.strip()
                    if current_heading in s:
                        old_last_char = s[current_heading][-1]
                        if stripped_text in self.__possible_ligatures:
                            text = text.rstrip()
                            is_ligature = True
                        elif is_ligature:
                            text = text.lstrip()
                            s[current_heading] = s[current_heading].rstrip()
                            is_ligature = False
                        elif (old_last_char.isalpha() and text[0].isalpha()) or (
                            old_last_char in sentence_delimitters and text[0].isupper()
                        ):
                            text = " " + text
                        s[current_heading] += text
                    else:
                        if stripped_text:
                            s[current_heading] = text.lstrip()

        return s

    @cached_property
    def title(self) -> str:
        """Document title.

        Iterates around the first page, concatenating text chunks with large font sizes.
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
                else:
                    title_chunks[text_size] += " " + str(span["text"])

        # Attempt to get title (more than 1 word) with largest font
        parsed_title = ""
        title_chunks_max = 0.0
        for key in title_chunks.keys():
            if key > title_chunks_max and len(title_chunks[key].split()) > 1:
                title_chunks_max = key

        if title_chunks_max != 0.0:
            parsed_title = title_chunks[title_chunks_max]

        # TODO: Check if the metadata title is more than one word
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
        """Spans per page.

        Zero-based
        """
        spans: dict[int, list] = {}

        for page_no, page_content in self.pages.items():
            spans[page_no] = []
            for block in page_content["blocks"]:
                if "lines" in block:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            spans[page_no].append(span)
                elif "image" in block:
                    spans[page_no].append(block)

        return spans


if __name__ == "__main__":
    pass
    # import os

    # for file in os.listdir("samples"):
    #     if not file.endswith("25528.pdf"):
    #         continue
    #     with (
    #         open(os.path.join("samples", file), "rb") as pdf,
    #         Parser(pdf.read()) as test,
    #     ):
    #         print(test.spans)
    #         print(test.toc)
    #         for k, v in test.sections.items():
    #             print("\033[1m" + k + "\033[0m")
    #             print(v)
    #             print("\n")
