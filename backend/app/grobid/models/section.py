"""Represents the text sections in a scholarly article."""
# TODO: use pydantic dataclass or BaseModel when pydantic is updated to v1.9
from dataclasses import dataclass, field


@dataclass
class Ref:
    """Represents <ref> XML tag.

    Stores the start and end positions of the reference rather than the text.
    """

    start: int
    end: int
    target: str | None = None
    type_: str | None = None


@dataclass
class RefText:
    """Represents the <p> XML tag.

    Supports embedded <ref> XML tags.
    """

    text: str
    refs: list[Ref] = field(default_factory=list)


@dataclass
class Section:
    """Represents <div> tag with <head> tag."""

    title: str
    paragraphs: list[RefText] = field(default_factory=list)
