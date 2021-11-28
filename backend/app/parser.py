"""Parses PDFs and provides methods to simplify content extraction.

Potentially supports other document types thanks to PyMuPDF.

Example:
    doc = Parser("doc.pdf")
    doc.text

Todo:
    * Add more methods
    * Add tests
"""

import typing
from datetime import datetime, timezone
from functools import cached_property

import fitz


class Parser:
    """Parse PDF given document.

    Attributes:
        _doc (Document): fitz document
    """

    # TODO: does string input need to be handled as well?
    def __init__(self, file: typing.Union[bytes, str]):
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

        """
        dt: datetime = datetime.strptime(date.replace("'", ""), "D:%Y%m%d%H%M%S%z")
        utc_dt = dt.replace(tzinfo=timezone.utc)
        return utc_dt.timestamp()

    @cached_property
    def metadata(self) -> dict:
        """Document metadata.

        Returns:
            dict: Title, author and creation timestamp

        """
        metadata: dict = {}

        metadata["title"] = self._doc.metadata["title"]
        metadata["author"] = self._doc.metadata["author"]
        metadata["creationTimestamp"] = self.__date_to_timestamp(
            self._doc.metadata["creationDate"]
        )

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


if __name__ == "__main__":
    with open("samples/sampleScholar.pdf", "rb") as file:
        test = Parser(file.read())

    print(f'Title: {test.metadata["title"]}')
    print(f'Author: {test.metadata["author"]}')
    print(
        f'Creation date: {datetime.fromtimestamp(test.metadata["creationTimestamp"])}'
    )

    print("\nTop level headings:")
    for t in test.toc:
        if t[0] == 1:
            print(t)

    print()
    print("Top 10 words are:")
    words = {}
    common_stop = [
        "the",
        "of",
        "and",
        "to",
        "a",
        "in",
        "for",
        "is",
        "that",
        "are",
        "by",
        "be",
        "as",
        "this",
        "on",
        "with",
        "from",
        "an",
        "they",
        "we",
        "our",
        "more",
    ]
    for word in test.text.lower().split():
        if word in words:
            words[word] += 1
        elif word not in common_stop:
            words[word] = 1
    words = dict(sorted(words.items(), key=lambda item: item[1], reverse=True))
    i = 0
    for key in words:
        if i == 10:
            break
        print(key, ": ", words[key])
        i += 1
