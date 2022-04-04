"""Contains endpoint for the API.

Todo:
    * add check for size error in recieve_file
    * add more endpoints
"""

import dataclasses
import fastapi
import httpx
from app.api.models import UploadReponseNew, UploadResponse
from app.grobid.client import Client
from app.grobid.models.file import File
from app.grobid.models.form import Form
from app.grobid.tei import TEI
from app.nlp.techniques import Techniques
from app.parser import Parser
from fastapi import APIRouter, HTTPException, UploadFile, status
from spacy import load

router = APIRouter()


@router.on_event("startup")
def load_model():
    """Load model once to be passed around as an instance."""
    global model
    model = load("en_core_web_sm")


@router.post("/upload", response_model=UploadResponse)
async def recieve_file(file: UploadFile = fastapi.File(...)):
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


# TODO: add UploadReponseNew as response_model when pydantic is v1.9
@router.post("/parse")
async def parse_pdf(file: UploadFile = fastapi.File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(400, detail="Invalid document type")

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
        return HTTPException(400, detail="Couldn't serialise response object")


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
