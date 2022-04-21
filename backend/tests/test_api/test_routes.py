"""Unit tests for API routes."""
# from app.api.models import UploadResponse
from app.config import Settings, get_settings
from app.main import app
from fastapi import status
from fastapi.testclient import TestClient
import respx
import httpx

from tests.test_grobid.test_tei import TestParse


API_URL = "http://validurl:8070"


def get_settings_overrides():
    """Mock .env file."""
    return Settings(grobid_api_url=API_URL)


class TestRecieveFile:
    """Unit tests for `/upload` endpoint.

    Todo:
        * Add invalid tests
    """

    import fitz

    with fitz.open(filetype="pdf") as test_pdf:
        # Required to save pdf
        test_pdf.new_page()
        test_obj: bytes = test_pdf.tobytes()

    app.dependency_overrides[get_settings] = get_settings_overrides

    def test_invalid_mime(self):
        """Should only accept PDFs."""
        with TestClient(app) as client:
            response = client.post(
                "/upload",
                files={"file": ("filename", self.test_obj, "application/zip")},
            )

        assert response.status_code == status.HTTP_415_UNSUPPORTED_MEDIA_TYPE

    def test_invalid_document(self):
        """Should only accept PDFs."""
        with TestClient(app) as client:
            response = client.post(
                "/upload", files={"file": ("filename", b"", "application/pdf")}
            )

        assert response.status_code == status.HTTP_415_UNSUPPORTED_MEDIA_TYPE

    def test_grobid_client_error(self):
        """Cannot connect to an invalid GROBID API URL."""
        with TestClient(app) as client:
            response = client.post(
                "/upload",
                files={"file": ("filename", self.test_obj, "application/pdf")},
            )

        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE

    @respx.mock
    def test_grobid_parser_error(self):
        """Empty PDF cannot be parsed."""
        with TestClient(app) as client:
            respx.mock.post(API_URL).mock(return_value=httpx.Response(200))
            response = client.post(
                "/upload",
                files={"file": ("filename", self.test_obj, "application/pdf")},
            )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @respx.mock
    def test_valid_request(self):
        """Mock XML response from GROBID API."""
        from app.grobid.models import (
            Article,
            Citation,
            Author,
            PersonName,
            Section,
            RefText,
        )

        article = Article(
            bibliography=Citation(
                title="Test",
                authors=[
                    Author(
                        PersonName("Doe", "John"),
                    )
                ],
            ),
            keywords=set(),
            sections=[Section("Introduction", [RefText("Lorem Ipsum")])],
            abstract=Section("Abstract", [RefText("Foo Bar")]),
            citations=dict(
                test=Citation(
                    title="Test2",
                    authors=[Author(PersonName("Doe", "Jane"))],
                )
            ),
        )
        xml = TestParse.build_xml(article)
        with TestClient(app) as client:
            respx.mock.post(API_URL).mock(
                return_value=httpx.Response(status_code=200, content=xml)
            )
            response = client.post(
                "/upload",
                files={"file": ("filename", self.test_obj, "application/pdf")},
            )

        assert response.status_code == status.HTTP_200_OK


class TestValidateURL:
    """Unit tests for '/validate_url/' endpoint.

    Todo:
        * Add invalid tests
    """

    client = TestClient(app)

    def test_valid_request(self):
        """Request should return 200/0K and valid json response."""
        response = self.client.get(
            "/validate_url/", params={"url": "https://www.orimi.com/pdf-test.pdf"}
        )
        assert response.status_code == 200

    def test_invalid_url(self):
        """Request should return 500 and invalid json response."""
        response = self.client.get("/validate_url/", params={"url": "invalidlink"})
        assert response.status_code == 500

    def test_invalid_request(self):
        """Request shouldn't return 200 status code and unsuccessful json."""
        response = self.client.get(
            "/validate_url/",
            params={"url": "https://www.businessinsider.com/techreference"},
        )
        assert response.status_code != 200

    def test_invalid_pdf(self):
        """Request should return 415 and unsupported json."""
        response = self.client.get(
            "/validate_url/", params={"url": "http://www.google.com"}
        )
        assert response.status_code == 415
