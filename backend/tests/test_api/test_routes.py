"""Unit tests for API routes.

Todo:
    * added more test cases for all
"""
import pytest

# from app.api.models import UploadResponse
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


@pytest.mark.skip(reason="upload endpoint changed")
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

    def test_valid_request(self):
        """Request should return 200/OK and response schema should be valid."""
        response = client.post(
            "/upload", files={"file": ("filename", self.test_obj, "application/pdf")}
        )
        assert response.status_code == 200
        # res_body = response.json()
        # assert UploadResponse.validate(res_body)


class TestValidateURL:
    """Unit tests for '/validate_url/' endpoint.

    Todo:
        * Add invalid tests
    """

    def test_valid_request(self):
        """Request should return 200/0K and valid json response."""
        response = client.get(
            "/validate_url/", params={"url": "https://www.orimi.com/pdf-test.pdf"}
        )
        assert response.status_code == 200

    def test_invalid_url(self):
        """Request should return 500 and invalid json response."""
        response = client.get("/validate_url/", params={"url": "invalidlink"})
        assert response.status_code == 500

    def test_invalid_request(self):
        """Request shouldn't return 200 status code and unsuccessful json."""
        response = client.get(
            "/validate_url/",
            params={"url": "https://www.businessinsider.com/techreference"},
        )
        assert response.status_code != 200

    def test_invalid_pdf(self):
        """Request should return 415 and unsupported json."""
        response = client.get("/validate_url/", params={"url": "http://www.google.com"})
        assert response.status_code == 415
