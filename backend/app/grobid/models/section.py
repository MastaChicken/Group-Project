# TODO: use pydantic dataclass or BaseModel when pydantic is updated to v1.9
from dataclasses import dataclass, field

@dataclass
class Ref:
    start: int
    end: int
    target: str | None = None
    type: str | None = None

@dataclass
class RefText:
    text: str
    refs: list[Ref] = field(default_factory=list)

@dataclass
class Section:
    title: str
    paragraphs: list[RefText] = field(default_factory=list)
