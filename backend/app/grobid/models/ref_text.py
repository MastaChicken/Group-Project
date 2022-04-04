from dataclasses import dataclass, field

from app.grobid.models.ref import Ref

@dataclass
class RefText:
    text: str
    refs: list[Ref] = field(default_factory=list)
