# noqa: D100
from pathlib import Path
from typing import Any

import httpx
from app.grobid.file import File
from app.grobid.form import Form


class Client:
    """Client for GROBID's processFulltextDocument endpoint."""

    __api_url: str
    __form: Form

    def __init__(self, api_url: str, form: Form) -> None:  # noqa: D107
        self.__api_url = api_url
        self.__form = form

    def __build_request(self) -> dict[str, Any]:
        """Build request dictionary."""
        url = f"{self.__api_url}/processFulltextDocument"
        return dict(url=url, files=self.__form.to_dict())

    def __build_response(self, response: httpx.Response):
        """Build response depending on status code."""
        match response.status_code:
            case 200:
                print(response.content)
            case 204:
                print("No content could be extracted and structured")
            case 400:
                print("Wrong request, missing parameters, missing header")
            case 500:
                print("Internal service error")
            case 503:
                print("Service not available")
            case _:
                print("Uncaught error")

    async def asyncio_request(self):  # noqa: D102
        kwargs = self.__build_request()
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(**kwargs)
                self.__build_response(response)
            except httpx.RequestError as exc:
                print(f"An error occurred while requesting {exc.request.url!r}.")

    def sync_request(self):  # noqa: D102
        kwargs = self.__build_request()
        try:
            response = httpx.post(**kwargs)
            self.__build_response(response)
        except httpx.RequestError as exc:
            print(f"An error occurred while requesting {exc.request.url!r}.")


if __name__ == "__main__":
    pdf_file = Path("study/ian-knight.pdf")
    with open(pdf_file, "rb") as file:
        form = Form(
            file=File(
                payload=file, file_name=pdf_file.name, mime_type="application/pdf"
            )
        )
        c = Client(api_url="http://localhost:8071/api", form=form)
        c.sync_request()
