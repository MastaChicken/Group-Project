# noqa: D100
from typing import Any

from app.grobid.file import File


class Form:
    """Represents form data accepted by GROBID's processFulltextDocument endpoint."""

    __file: File
    __segment_sentences: bool | None
    __consolidate_header: int | None
    __consolidate_citations: int | None
    __include_raw_citations: bool | None
    __include_raw_affiliations: bool | None
    __tei_coordinates: str | None

    def __init__(  # noqa: D107
        self,
        file: File,
        segment_sentences: bool = None,
        consolidate_header: int = None,
        consolidate_citations: int = None,
        include_raw_citations: bool = None,
        include_raw_affiliations: bool = None,
        tei_coordinates: str = None,
    ) -> None:
        self.__file = file
        self.__segment_sentences = segment_sentences
        self.__consolidate_header = consolidate_header
        self.__consolidate_citations = consolidate_citations
        self.__include_raw_citations = include_raw_citations
        self.__include_raw_affiliations = include_raw_affiliations
        self.__tei_coordinates = tei_coordinates

    def to_dict(self) -> dict[str, Any]:
        """Return dictionary for multipart/form-data."""
        form_dict: dict[str, Any] = {}

        form_dict["input"] = self.__file.to_tuple()

        if self.__segment_sentences:
            form_dict["segmentSentences"] = "1"

        match self.__consolidate_header:
            case [0, 1, 2]:
                form_dict["consolidateHeader"] = str(self.__consolidate_header)

        match self.__consolidate_citations:
            case [0, 1, 2]:
                form_dict["consolidateCitations"] = str(self.__consolidate_citations)

        if self.__include_raw_citations is not None:
            form_dict["includeRawCitations"] = self.__include_raw_citations

        if self.__include_raw_affiliations is not None:
            form_dict["includeRawAffiliations"] = self.__include_raw_affiliations

        if self.__tei_coordinates is not None:
            form_dict["teiCoordinates"] = self.__tei_coordinates

        return form_dict
