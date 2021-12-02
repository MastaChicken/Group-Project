"""Contains endpoint for the API.

Todo:
    * add check for size error in recieve_file
    * add more endpoints
"""

import requests
from app.parser import Parser, ParserModel
from fastapi import APIRouter, File, HTTPException, UploadFile, status

router = APIRouter()


@router.post("/upload", response_model=ParserModel)
async def recieve_file(file: UploadFile = File(...)):
    """Recieves uploaded file and sets it to object.

    Args:
        file: file which is uploaded
    Returns:
        Metadata, text and table of contents
    Raises:
        SizeError: if given file is too large
    """
    contents = await file.read()

    with Parser(contents) as out:
        return ParserModel(metadata=out.metadata, text=out.text, toc=out.toc)


@router.get("/validate_url/")
def validate_pdf_url(url: str):
    """Check to see if URL of a PDF is valid.

    Args:
        url: url to be validated
    Returns:
        Status code and detail of request
    Raises:
        HTTPException: URL of a PDF is invalid
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
