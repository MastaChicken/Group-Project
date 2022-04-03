from dataclasses import dataclass

@dataclass
class Scope:
    volume: int | None = None
    pages: tuple[int, int] | None = None
