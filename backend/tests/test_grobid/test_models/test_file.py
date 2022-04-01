"""Unit tests for grobid/file module."""


from typing import BinaryIO

from app.grobid.models.file import File


class TestFile:
    """Unit tests for File class."""

    import fitz

    with fitz.open(filetype="pdf") as test_pdf:
        test_pdf.new_page()
        test_obj: BinaryIO = test_pdf.tobytes()

    def test_no_opt_params(self):
        file: File = File(self.test_obj)

        assert file.to_tuple() == (None, self.test_obj, None)

    def test_file_name_param(self):
        file_name = "test"
        file: File = File(self.test_obj, file_name=file_name)

        assert file.to_tuple() == (file_name, self.test_obj, None)

    def test_mime_type_param(self):
        mime_type = "application/pdf"
        file: File = File(self.test_obj, mime_type=mime_type)

        assert file.to_tuple() == (None, self.test_obj, mime_type)

    def test_all_params(self):
        file_name = "test"
        mime_type = "application/pdf"
        file: File = File(self.test_obj, file_name=file_name, mime_type=mime_type)

        assert file.to_tuple() == (file_name, self.test_obj, mime_type)
