from dataclasses import dataclass, field

from app.grobid.models.affiliation import Affiliation
from app.grobid.models.person_name import PersonName


@dataclass
class Author:
    person_name: PersonName
    affiliations: list[Affiliation] = field(default_factory=list)
    email: str | None = None
