from app.parser import Parser
import fitz

from datetime import datetime, timezone

new_pdf = fitz.open()

pdf_title = "Test PDF"
pdf_author = "Wil"
pdf_time = fitz.get_pdf_now()

new_pdf.set_metadata({"title": pdf_title, "author": pdf_author, "creationDate": pdf_time})

now_time = float(int(datetime.timestamp(datetime.now())))

new_pdf.new_page()

new_pdf.save("test.pdf")

doc = Parser("test.pdf")

def test_pdf_title():
    title = doc.metadata["title"]
    assert title == pdf_title

def test_pdf_authors():
    author = doc.metadata["author"]
    assert author == pdf_author

def test_pdf_timestamp():
    cTime = doc.metadata["creationTimestamp"]
    assert cTime == now_time