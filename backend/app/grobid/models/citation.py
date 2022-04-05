"""Represents a citation, including all the relevant information."""
# TODO: use pydantic dataclass or BaseModel when pydantic is updated to v1.9
from dataclasses import dataclass, field


@dataclass
class PageRange:
    """Represents the 'to' and 'from' attributes in <biblScope/> XML tag."""

    from_page: int
    to_page: int


@dataclass
class Scope:
    """Represents the <biblScope/> XML tag."""

    volume: int | None = None
    pages: PageRange | None = None


@dataclass
class Date:
    """Represents the 'when' attribute in the <date/> XML tag."""

    year: str
    month: str | None = None
    day: str | None = None


@dataclass
class PersonName:
    """Represents the <persName/> XML tag."""

    surname: str
    first_name: str | None = None
    # middle_name: str | None = None
    # title: str | None = None

    @property
    def to_string(self) -> str:
        """Return string representation of object."""
        if self.first_name:
            return f"{self.first_name} {self.surname}"
        else:
            return f"{self.surname}"


@dataclass
class Affiliation:
    """Represents the <affiliation> XML tag."""

    # key: str
    department: str | None = None
    institution: str | None = None
    laboratory: str | None = None
    # address: Address | None = None


@dataclass
class Author:
    """Represents the <author> XML tag."""

    person_name: PersonName
    affiliations: list[Affiliation] = field(default_factory=list)
    email: str | None = None


@dataclass
class CitationIDs:
    """Represents the <idno> XML tag."""

    doi: str | None = None
    arxiv: str | None = None
    # issn: str | None = None
    # pii: str | None = None
    # other: str | None = None


@dataclass
class Citation:
    """Represents the <biblStruct> XML tag."""

    title: str
    authors: list[Author] = field(default_factory=list)
    date: Date | None = None
    ids: CitationIDs | None = None
    target: str | None = None
    publisher: str | None = None
    journal: str | None = None
    series: str | None = None
    scope: Scope | None = None
    # meeting: str | None = None
    # phone: str | None = None
