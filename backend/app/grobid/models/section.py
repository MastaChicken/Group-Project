from dataclasses import dataclass, field

from app.grobid.models.ref_text import RefText

@dataclass
class Section:
    title: str
    paragraphs: list[RefText] = field(default_factory=list)
