"""Unit tests for grobid/form module."""


from typing import BinaryIO

from app.grobid.models.file import File
from app.grobid.models.form import Form


class TestFile:
    """Unit tests for Form class."""

    import fitz

    with fitz.open(filetype="pdf") as test_pdf:
        test_pdf.new_page()
        test_obj: BinaryIO = test_pdf.tobytes()

    file: File = File(test_obj)

    def test_no_opt_params(self):
        form: Form = Form(self.file)

        assert form.to_dict() == dict(input=self.file.to_tuple())
