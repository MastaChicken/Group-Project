"""Contains endpoint for the API.

Todo:
    * add check for size error in recieve_file
    * add more endpoints
"""

import dataclasses

import fastapi
import httpx

# f# rom app.api.models import UploadReponseNew, UploadResponse
from app.grobid.client import Client
from app.grobid.models.form import File, Form
from app.grobid.tei import TEI
from fastapi import APIRouter, HTTPException, UploadFile, status
from spacy import load

router = APIRouter()


@router.on_event("startup")
def load_model():
    """Load model once to be passed around as an instance."""
    global model
    model = load("en_core_web_sm")


@router.post("/upload")
async def recieve_file(file: UploadFile = fastapi.File(...)):
    """Parse uploaded file.

    Args:
        file: file which is uploaded
    Returns:
        Article object
    Raises:
        HTTPException: the file cannot be parsed
    """
    contents = await file.read()

    if file.content_type != "application/pdf":
        raise HTTPException(415, detail="Invalid document type")

    contents = await file.read()
    if not isinstance(contents, bytes):
        raise HTTPException(400, detail="Couldn't read document")
    form = Form(
        file=File(
            payload=contents, file_name=file.filename, mime_type=file.content_type
        )
    )

    # FIXME: API_URL should be a constant and not pointing to docker
    c = Client(api_url="http://host.docker.internal:8070/api", form=form)
    r = await c.asyncio_request()
    t = TEI(r.content, model)
    a = t.parse()

    if a is None:
        return HTTPException(400, detail="Couldn't parse document")

    try:
        return dataclasses.asdict(a)
    except TypeError:
        return HTTPException(500, detail="Couldn't serialise response object")


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
