"""Unit tests for API routes.

Todo:
    
"""
from typing import Any
from fastapi.exceptions import HTTPException
from requests.utils import quote
from app.main import app
from app.parser import ParserModel
from fastapi.testclient import TestClient
import pytest

client = TestClient(app)


class TestRecieveFile:
    """Unit tests for `/upload` endpoint.

    Todo:
        * Add invalid tests
    """

    import fitz

    test_pdf = fitz.open()
    # Required to save pdf
    test_pdf.new_page()
    test_obj: bytes = test_pdf.tobytes()

    def test_valid_request(self) -> Any:
        """Request should return 200/OK and response schema should be valid."""
        response = client.post(
            "/upload", files={"file": ("filename", self.test_obj, "application/pdf")}
        )
        res_body = response.json()
        assert response.status_code == 200
        assert ParserModel.validate(res_body)


class TestValidateURL:
    """Unit tests for '/validate_url/' endpoint.

    Todo:
        * Add invalid tests
    """

    def test_valid_request(self) -> Any:
        """Request should return 200/0K and valid json response."""

        response = client.get(
            "/validate_url/", params={"url": "https://www.orimi.com/pdf-test.pdf"}
        )
        assert response.status_code == 200
        assert response.json()["detail"] == "PDF URL is valid"
