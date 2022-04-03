# TODO: use pydantic dataclass or BaseModel when pydantic is updated to v1.9
from dataclasses import dataclass

from app.grobid.models.citation import Citation


@dataclass
class Article:
    bibliography: Citation
    keywords: set[str]
    citations: dict[str, Citation]
    # sections
