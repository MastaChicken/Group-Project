"""Contains endpoint for the API.

Todo:
    * add check for size error in recieve_file
    * add more endpoints
"""

import requests
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from spacy import load

from app.api.models import UploadResponse
from app.nlp.techniques import Techniques
from app.parser import Parser

router = APIRouter()


@router.on_event("startup")
def load_model():
    """Load model once to be passed around as an instance."""
    global model
    model = load("en_core_web_sm")


@router.post("/upload", response_model=UploadResponse)
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

    with Parser(contents) as doc:
        text = ""
        spans = doc.spans.get(1, {})
        for values in spans:
            text += values["text"] + " "

        summary = []
        common_words = []
        # FIXME: this is a workaround to ensure that tests continue to pass
        if text:
            nlp = Techniques(model, text)
            summary = nlp.extractive_summarisation(5)
            common_words = nlp.top_common_n_words(10)
        return UploadResponse(
            title=doc.title,
            metadata=doc.metadata,
            toc=doc.toc,
            summary=summary,
            common_words=common_words,
        )


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
