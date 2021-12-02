"""Unit tests for the properties and methods in Parser.

Todo:
    * Add tests for future methods
"""
from datetime import datetime
from typing import Any

import fitz
from app.parser import Parser


class TestParserProperties:
    """Unit tests for parser properties.

    Todo:
        * Add invalid tests
    """

    new_pdf = fitz.open()
    new_pdf.new_page()

    def test_pdf_title(self) -> Any:
        pdf_title = "Test PDF"
        self.new_pdf.set_metadata({"title": pdf_title})
        with Parser(self.new_pdf.tobytes()) as doc:
            title = doc.metadata["title"]

        assert title == pdf_title

    def test_pdf_authors(self) -> Any:
        pdf_author = "Wil"
        self.new_pdf.set_metadata({"author": pdf_author})
        with Parser(self.new_pdf.tobytes()) as doc:
            author = doc.metadata["author"]

        assert author == pdf_author

    def test_pdf_timestamp(self) -> Any:
        pdf_time = fitz.get_pdf_now()
        now_time = float(int(datetime.timestamp(datetime.now())))
        self.new_pdf.set_metadata({"creationDate": pdf_time})
        with Parser(self.new_pdf.tobytes()) as doc:
            c_time = doc.metadata["creationTimestamp"]

        assert c_time == now_time
