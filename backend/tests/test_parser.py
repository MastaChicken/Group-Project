"""Unit tests for the properties and methods in Parser.

Todo:
    * Add tests for future methods
"""
import fitz

from app.parser import Parser


class TestParser:
    """Base class for parser tests."""

    pdf = fitz.open()

    @classmethod
    def empty_new_page(cls) -> fitz.Page:
        """Create only one new empty page."""
        if cls.pdf.page_count:
            cls.pdf.delete_page(0)
        return cls.pdf.new_page()


class TestParserTitle(TestParser):
    """Unit tests for parser title."""

    def test_text_title(self):
        """Should extract the title from the text itself."""
        page = TestParser.empty_new_page()
        pdf_title = "PDF Title"
        title_p = fitz.Point(0, 0)
        text_p = fitz.Point(50, 0)
        self.pdf.set_metadata({})
        page.insert_text(title_p, "PDF Title", fontsize=15)
        page.insert_text(
            text_p,
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            fontsize=11,
        )

        with Parser(self.pdf.tobytes()) as doc:
            extracted_title = doc.title

        assert extracted_title == pdf_title

    def test_metadata_title(self):
        """Should fallback to the metadata title.

        This occurs when the largest font isn't the title
        """
        page = TestParser.empty_new_page()
        pdf_title = "PDF Title"
        title_p = fitz.Point(0, 0)
        heading_p = fitz.Point(50, 0)
        text_p = fitz.Point(100, 0)
        self.pdf.set_metadata({"title": pdf_title})
        page.insert_text(title_p, "PDF Title", fontsize=10)
        page.insert_text(
            heading_p,
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
            fontsize=11,
        )
        page.insert_text(
            text_p,
            "Sed enim mi, fermentum et odio sit amet, maximus egestas.",
            fontsize=9,
        )

        with Parser(self.pdf.tobytes()) as doc:
            extracted_title = doc.title

        assert extracted_title == pdf_title

    def test_metadata_empty_page(self):
        """Should get the metdata title.

        Page is empty, but metadata title still exists
        """
        TestParser.empty_new_page()
        pdf_title = "PDF Title"

        self.pdf.set_metadata({"title": pdf_title})

        with Parser(self.pdf.tobytes()) as doc:
            extracted_title = doc.title

        assert extracted_title == pdf_title

    def test_empty_first_page(self):
        """Should return an empty string.

        No metadata title or text on first page
        Should fallback in the frontend by using the file name
        File name is not available on the backend since Parser takes bytes
        """
        TestParser.empty_new_page()

        self.pdf.set_metadata({})
        with Parser(self.pdf.tobytes()) as doc:
            extracted_title = doc.title

        assert extracted_title == ""


class TestParserMetadata(TestParser):
    """Unit tests for parser metadata property.

    Todo:
        * Add invalid tests
    """

    TestParser.empty_new_page()

    def test_title(self):
        """Should always pass.

        Title extraction is stored as its own property
        """
        pdf_title = "Test PDF"
        self.pdf.set_metadata({"title": pdf_title})
        with Parser(self.pdf.tobytes()) as doc:
            title = doc.metadata["title"]

        assert title == pdf_title

    def test_pdf_authors(self):
        """Should always pass."""
        pdf_author = "Lorem"
        self.pdf.set_metadata({"author": pdf_author})
        with Parser(self.pdf.tobytes()) as doc:
            author = doc.metadata["author"]

        assert author == pdf_author

    def test_pdf_timestamp(self):
        """Test the parsing of the CreationDate key."""
        pdf_time: str = fitz.get_pdf_now()
        self.pdf.set_metadata({"creationDate": pdf_time})
        with Parser(self.pdf.tobytes()) as doc:
            c_time = doc.metadata["creationTimestamp"]

        assert Parser.date_to_timestamp(pdf_time) == c_time
