"""Unit tests for the document module."""
import fitz
from fitz.fitz import Rect

from app.document import PDF
import pytest


class TestPDF:
    """Unit tests for PDF class."""

    pdf = fitz.open()

    @classmethod
    def empty_new_page(cls) -> fitz.Page:
        """Create only one new empty page."""
        if cls.pdf.page_count:
            cls.pdf.delete_page(0)
        return cls.pdf.new_page()

    def test_valid_pdf_context(self):
        """Tests the context manager."""
        self.empty_new_page()
        with PDF(self.pdf.tobytes()):
            pass

    def test_empty_bytes(self):
        """Empty bytes should always error out."""
        with pytest.raises(RuntimeError, match="PDF file could not be read"):
            PDF(b"")

    @pytest.mark.skip(reason="Should raise PermissionError")
    def test_encrypted_pdf(self):
        """Encrypted PDF will always error out."""
        self.empty_new_page()
        with pytest.raises(PermissionError, match="Document is encrypted"):
            PDF(self.pdf.tobytes(user_pw="test"))

    def test_pdf_bytes(self):
        """Check that it cannot fail."""
        self.empty_new_page()
        with PDF(self.pdf.tobytes()) as pdf:
            pdf_bytes = pdf.bytes_

        assert type(pdf_bytes) == bytes

    def test_pdf_no_uid(self):
        """Tests that UID is not returned if failed to parse."""
        self.empty_new_page()
        with PDF(self.pdf.tobytes()) as pdf:
            pdf_uid = pdf.uid

        assert pdf_uid is None

    def test_pdf_doi_text(self):
        """Tests DOI is parsed when inserted as plain text."""
        page = self.empty_new_page()
        doi = "10.1000/182"
        doi_p = fitz.Point(0, 0)
        page.insert_text(doi_p, doi, fontsize=15)

        with PDF(self.pdf.tobytes()) as pdf:
            assert pdf.uid == doi

    def test_pdf_doi_link_1(self):
        """Tests DOI is parsed when inserted as dx.doi.org link."""
        page = self.empty_new_page()
        doi = "10.1000/182"
        link_dict = {
            "uri": f"http://dx.doi.org/{doi}",
            "kind": fitz.LINK_URI,
            "from": Rect(0, 0, 0, 0),
        }
        page.insert_link(link_dict)

        with PDF(self.pdf.tobytes()) as pdf:
            assert pdf.uid == doi

    def test_pdf_doi_link_2(self):
        """Tests DOI is parsed when inserted as crossmark.crossref.org link."""
        page = self.empty_new_page()
        doi = "10.1000/182"
        link_dict = {
            "uri": f"http://crossmark.crossref.org/dialog/?doi={doi}",
            "kind": fitz.LINK_URI,
            "from": Rect(0, 0, 0, 0),
        }
        page.insert_link(link_dict)

        with PDF(self.pdf.tobytes()) as pdf:
            assert pdf.uid == doi
