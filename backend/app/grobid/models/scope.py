from dataclasses import dataclass

@dataclass
class PageRange:
    from_page: int
    to_page: int

@dataclass
class Scope:
    volume: int | None = None
    pages: PageRange | None = None

