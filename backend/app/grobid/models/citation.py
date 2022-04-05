# TODO: use pydantic dataclass or BaseModel when pydantic is updated to v1.9
from dataclasses import dataclass, field

@dataclass
class PageRange:
    from_page: int
    to_page: int

@dataclass
class Scope:
    volume: int | None = None
    pages: PageRange | None = None

@dataclass
class Date:
    year: str
    month: str | None = None
    day: str | None = None

@dataclass
class PersonName:
    surname: str
    first_name: str | None = None
    # middle_name: str | None = None
    # title: str | None = None

    @property
    def to_string(self) -> str:
        if self.first_name:
            return f"{self.first_name} {self.surname}"
        else:
            return f"{self.surname}"

@dataclass
class Affiliation:
    department: str | None = None
    institution: str | None = None
    laboratory: str | None = None

@dataclass
class Author:
    person_name: PersonName
    affiliations: list[Affiliation] = field(default_factory=list)
    email: str | None = None

@dataclass
class Citation:
    title: str
    authors: list[Author] = field(default_factory=list)
    date: Date | None = None
    doi: str | None = None
    ptr: str | None = None
    publisher: str | None = None
    scope: Scope | None = None
