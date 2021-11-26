"""Parses PDFs and provides methods to simplify content extraction.

Potentially supports other document types thanks to PyMuPDF.

Example:
    doc = Parser("doc.pdf")
    doc.text

Todo:
    * Add more methods
    * Add tests
"""

from datetime import datetime
from functools import cached_property

import fitz


class Parser:
    """Parse PDF given document.

    Attributes:
        _doc (Document): fitz document
    """

    def __init__(self, path: str):
        """Open the document.

        Args:
            path: path of the document

        """
        self._doc = fitz.open(path)

    @classmethod
    def __date_to_timestamp(cls, date: str) -> float:
        """Convert ISO date to UNIX timestamp.

        Args:
            date (str): ISO date

        Returns:
            float: UNIX timestamp

        """
        # TODO: check if date is correct
        # TODO: parse timezone
        utc_dt: datetime = datetime.strptime(date, "D:%Y%m%d%H%M%SZ")
        return utc_dt.timestamp()
        # year = int(date[2:6])
        # month = int(date[6:8])
        # day = int(date[8:10])
        # hour = int(date[10:12])
        # minute = int(date[12:14])
        # second = int(date[14:16])

        # return datetime(year, month, day, hour, minute, second).timestamp()

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
    test = Parser("samples/sampleScholar.pdf")

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
