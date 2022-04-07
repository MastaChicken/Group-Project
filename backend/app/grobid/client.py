# noqa: D100
# TODO: use pydantic dataclass or BaseModel when pydantic is updated to v1.9
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx
from app.grobid.models import File, Form, Response
from app.grobid.tei import TEI
from spacy import load


class GrobidClientError(BaseException):
    """Exception for Client class."""

    pass


@dataclass
class Client:
    """Client for GROBID's processFulltextDocument endpoint."""

    api_url: str
    form: Form

    def __build_request(self) -> dict[str, Any]:
        """Build request dictionary."""
        url = f"{self.api_url}/processFulltextDocument"
        # TODO: not sure what the timeout should be
        timeout = httpx.Timeout(None)
        return dict(url=url, files=self.form.to_dict(), timeout=timeout)

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

    async def asyncio_request(self) -> Response:
        """
        Request client asynchronously.

        Raises:
            GrobidClientError: if httpx.RequestError or httpx.HTTPError is raised
        """
        kwargs = self.__build_request()
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(**kwargs)
                return self.__build_response(response)
            except httpx.RequestError as exc:
                raise GrobidClientError(
                    f"An error occurred while requesting {exc.request.url!r}."
                )
            except httpx.HTTPError as exc:
                raise GrobidClientError(exc)

    def sync_request(self) -> Response:
        """
        Request client synchronously.

        Raises:
            GrobidClientError: if httpx.RequestError or httpx.HTTPError is raised
        """
        kwargs = self.__build_request()
        try:
            response = httpx.post(**kwargs)
            return self.__build_response(response)
        except httpx.RequestError as exc:
            raise GrobidClientError(
                f"An error occurred while requesting {exc.request.url!r}."
            )
        except httpx.HTTPError as exc:
            raise GrobidClientError(exc)


if __name__ == "__main__":
    # pdf_file = Path("study/Simon_Langley-evans.pdf")
    # with open(pdf_file, "rb") as file:
    #     form = Form(
    #         file=File(
    #             payload=file.read(),
    #             file_name=pdf_file.name,
    #             mime_type="application/pdf",
    #         )
    #     )
    #     c = Client(api_url="http://localhost:8070/api", form=form)
    #     t = TEI(c.sync_request().content, load("en_core_web_sm"))
    #     a = t.parse()
    #     print(a)
    with open("study/ian-knight.xml", "rb") as f:
        t = TEI(f.read(), load("en_core_web_sm"))
        a = t.parse()

        # print(a.sections)
