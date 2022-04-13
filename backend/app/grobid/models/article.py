# noqa: D100
# TODO: use pydantic dataclass or BaseModel when pydantic is updated to v1.9
from dataclasses import dataclass

from app.grobid.models.citation import Citation
from app.grobid.models.section import Section


@dataclass
class Article:
    """Represents the scholarly article."""

    bibliography: Citation
    keywords: set[str]
    citations: dict[str, Citation]
    sections: list[Section]
    abstract: Section | None = None
