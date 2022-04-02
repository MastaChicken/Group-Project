from pydantic import BaseModel


class Article(BaseModel):
    title: str
    doi: str
    keywords: list[str]
    # bibliography
    # sections
    # citations
