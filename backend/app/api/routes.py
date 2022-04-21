"""Contains endpoint for the API.

Todo:
    * add check for size error in recieve_file
    * add more endpoints
"""

import dataclasses

import fastapi
from fastapi.param_functions import Depends
import httpx
from app.document import PDF

# from app.api.models import UploadResponse
from app.grobid.client import Client, GrobidClientError
from app.grobid.models.form import File, Form
from app.grobid.tei import TEI, GrobidParserError
from fastapi import APIRouter, HTTPException, UploadFile, status
import en_core_web_sm

from app.config import Settings, get_settings
from app.nlp.techniques import Phrase, Word

router = APIRouter()


@router.on_event("startup")
def load_globals():
    """Load instances once."""
    global model
    model = en_core_web_sm.load()


@router.post("/upload")
async def recieve_file(
    file: UploadFile = fastapi.File(...), settings: Settings = Depends(get_settings)
):
    """Parse uploaded file.

    Args:
        file: file which is uploaded
    Returns:
        Article object
    Raises:
        HTTPException: the file cannot be parsed
    """
    if file.content_type != "application/pdf":
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Invalid document type"
        )

    contents = await file.read()
    # Use PyMuPDF to open and fix the PDF
    try:
        with PDF(contents) as pdf:
            contents = pdf.bytes_
            uid = pdf.uid  # noqa
    except RuntimeError as exc:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=str(exc))

    form = Form(
        file=File(
            payload=contents, file_name=file.filename, mime_type=file.content_type
        )
    )

    try:
        client = Client(api_url=settings.grobid_api_url, form=form)
        response = await client.asyncio_request()
    except GrobidClientError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))

    tei = TEI(response.content, model)

    try:
        article = tei.parse()
    except GrobidParserError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))

    try:
        article_dict = dataclasses.asdict(article)
    except TypeError:
        return HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Couldn't serialise Article object",
        )

    article_text = []
    for section in article.sections:
        article_text.append(section.to_str())

    # Phrase counts
    phrase_ranks = {}
    if article.abstract:
        phrase = Phrase(article.abstract.to_str(), model)
        phrase_ranks = phrase.ranks

    # Common words
    # NOTE: uses full text
    common_words = []
    try:
        word = Word(" ".join(article_text), model)
        common_words = word.words_threshold_n(5)
    except RuntimeError:
        pass

    # TODO: use UploadResponse when pydantic is updated to v1.9
    # TODO: add summary
    return dict(
        article=article_dict,
        common_words=common_words,
        phrase_ranks=phrase_ranks,
        summary="",
    )


@router.get("/validate_url/")
async def validate_pdf_url(url: str):
    """Check to see if URL of a PDF is valid.

    Args:
        url: url to be validated
    Returns:
        Status code and detail of request
    Raises:
        HTTPException: URL of a PDF is invalid
    """
    try:
        async with httpx.AsyncClient() as client:
            res = await client.head(url)

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
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while requesting {exc.request.url!r}.",
        )
