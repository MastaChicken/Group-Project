from dataclasses import dataclass


@dataclass
class Affiliation:
    department: str | None = None
    institution: str | None = None
    laboratory: str | None = None
