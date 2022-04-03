from dataclasses import dataclass


@dataclass
class PersonName:
    surname: str
    first_name: str | None = None
    # middle_name: str | None = None
    # title: str | None = None

    @property
    def to_string(self) -> str:
        if self.first_name:
            return f"{self.first_name} {self.surname}"
        else:
            return f"{self.surname}"
