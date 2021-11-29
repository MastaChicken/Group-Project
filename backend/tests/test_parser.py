"""Tests the metadata from the pdf."""
from typing import Any
from app.parser import Parser
import fitz

from datetime import datetime

new_pdf = fitz.open()

pdf_title = "Test PDF"
pdf_author = "Wil"
pdf_time = fitz.get_pdf_now()

new_pdf.set_metadata(
    {"title": pdf_title, "author": pdf_author, "creationDate": pdf_time}
)

now_time = float(int(datetime.timestamp(datetime.now())))

new_pdf.new_page()

new_pdf.save("test.pdf")

doc = Parser("test.pdf")


def test_pdf_title() -> Any:
    """Test pdf title."""
    title = doc.metadata["title"]
    assert title == pdf_title


def test_pdf_authors() -> Any:
    """Test pdf author."""
    author = doc.metadata["author"]
    assert author == pdf_author


def test_pdf_timestamp() -> Any:
    """Test pdf timestamp."""
    c_time = doc.metadata["creationTimestamp"]
    assert c_time == now_time
