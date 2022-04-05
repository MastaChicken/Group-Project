from datetime import datetime
from dataclasses import dataclass, field

from app.grobid.models.author import Author
from app.grobid.models.date import Date
from app.grobid.models.scope import Scope


@dataclass
class Citation:
    title: str
    authors: list[Author] = field(default_factory=list)
    date: Date | None = None
    doi: str | None = None
    ptr: str | None = None
    publisher: str | None = None
    scope: Scope | None = None
