from dataclasses import dataclass


@dataclass
class Ref:
    start: int
    end: int
    target: str | None = None
    type: str | None = None
