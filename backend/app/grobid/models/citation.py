from datetime import datetime
from dataclasses import dataclass, field

from app.grobid.models.author import Author


@dataclass
class Citation:
    title: str
    authors: list[Author] = field(default_factory=list)
    date: datetime | None = None
    doi: str | None = None
    ptr: str | None = None
