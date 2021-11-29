"""Unit tests for API routes.

Todo:
    * Add tests for `/validate_url` endpoint
"""
from typing import Any

from app.main import app
from app.parser import ParserModel
from fastapi.testclient import TestClient

client = TestClient(app)


class TestRecieveFile:
    """Unit tests for `/upload` endpoint.

    Todo:
        * Add invalid tests
    """

    import fitz

    res_body = {}

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
