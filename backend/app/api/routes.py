"""Contains endpoint for the API.

Todo:
    * add check for size error in recieve_file
    * add more endpoints
"""

import requests
from app.parser import Parser
from fastapi import APIRouter, File, HTTPException, UploadFile, status

router = APIRouter()


@router.post("/upload")
async def recieve_file(file: UploadFile = File(...)):
    """Recieves uploaded file and sets it to object.

    Args:
        file: file which is uploaded
    Returns:
        JSON file describing text, table of contents and metadata
    Raises:
        SizeError: if given file is too large
    """
    # TODO: test with large pdfs? add to docstring
    contents = await file.read()
    test = Parser(contents)
    return {
        "summary": test.text,
        "toc": test.toc,
        "metadata": test.metadata,
    }


@router.get("/test/")
def valid_pdf_url(url: str):
    """Checks to see if URL of a PDF is valid.

    Args:
        url: url of the file to be validated
    Returns:
        JSON file determining saying file is valid
    Raises:
        RequestError: unable to request pdf from given url
        FileError: given url does not contain a pdf file
        FormatError: url is invalid link
    """
    try:
        res = requests.head(url)
        if res.status_code != 200:
            raise HTTPException(
                status_code=res.status_code, detail="Request unsuccessful"
            )
        if res.headers["Content-Type"] != "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="File has unsupported extension type",
            )
        return {"detail": "PDF URL is valid"}
    except requests.exceptions.RequestException:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Parameter has an invalid format",
        )
