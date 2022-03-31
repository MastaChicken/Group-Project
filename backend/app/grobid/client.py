# noqa: D100
from pathlib import Path
from typing import Any

import httpx
from app.grobid.file import File
from app.grobid.form import Form
from app.grobid.models.response import Response


class ClientException(BaseException):
    pass


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

    def __build_response(self, response: httpx.Response) -> Response:
        """Build Response object.

        Raises:
            httpx.HTTPError: if response has 203, 400, 503 or 500 status code
        """
        res = Response(
            status_code=response.status_code,
            content=response.content,
            headers=response.headers,
        )
        res.raise_for_status()

        return res

    async def asyncio_request(self) -> Response:  # noqa: D102
        kwargs = self.__build_request()
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(**kwargs)
                return self.__build_response(response)
            except httpx.RequestError as exc:
                raise ClientException(
                    f"An error occurred while requesting {exc.request.url!r}."
                )
            except httpx.HTTPError as exc:
                raise ClientException(exc)

    def sync_request(self) -> Response:  # noqa: D102
        kwargs = self.__build_request()
        try:
            response = httpx.post(**kwargs)
            return self.__build_response(response)
        except httpx.RequestError as exc:
            raise ClientException(
                f"An error occurred while requesting {exc.request.url!r}."
            )
        except httpx.HTTPError as exc:
            raise ClientException(exc)


if __name__ == "__main__":
    pdf_file = Path("study/ian-knight.pdf")
    with open(pdf_file, "rb") as file:
        form = Form(
            file=File(
                payload=file, file_name=pdf_file.name, mime_type="application/pdf"
            )
        )
        c = Client(api_url="http://localhost:8070/api", form=form)
        print(c.sync_request().content)
