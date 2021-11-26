import requests
from app.parser import Parser
from fastapi import APIRouter, HTTPException, status

router = APIRouter()


@router.get("/")
# NOTE: currently synchronous
async def read_root():
    test = Parser("samples/sampleScholar.pdf")
    return {"Hello": test.metadata["author"]}


@router.get("/test/")
def valid_pdf_url(url: str):
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
