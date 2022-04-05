from dataclasses import dataclass

@dataclass
class Date:
    year: str
    month: str | None = None
    day: str | None = None
