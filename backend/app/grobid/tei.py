from functools import cached_property

from bs4 import BeautifulSoup
from bs4.element import Tag
from spacy.language import Language


# TODO: use DOI from PyMuPDF to cache XML
class TEI:
    __soup: BeautifulSoup
    __model: Language

    def __init__(self, stream: bytes, model: Language) -> None:
        self.__soup = BeautifulSoup(stream, "lxml")
        self.__model = model

    @cached_property
    def title(self) -> str:
        title: str = ""
        if (title_tag := self.__soup.title) is not None:
            title = title_tag.text

        return title

    @cached_property
    def biblstruct_tag(self) -> Tag | None:
        if (source := self.__soup.find("sourcedesc")) is not None:
            biblstruct_tag = source.find("biblstruct")
            if type(biblstruct_tag) is Tag:
                return biblstruct_tag

    @cached_property
    def doi(self) -> str:
        doi: str = ""
        if (biblstruct_tag := self.biblstruct_tag) is not None:
            doi_tag = biblstruct_tag.find("idno", {"type": "DOI"})
            if doi_tag is not None:
                doi = doi_tag.text

        return doi

    @cached_property
    def keywords(self) -> list[str]:
        keywords: list[str] = []

        if (keywords_tag := self.__soup.keywords) is not None:
            for term in keywords_tag.find_all("term"):

                # TODO: maybe should use spacy to find the phrases
                if (keyword := self.clean_string(term.text)) != "":
                    keywords.append(keyword)

        return keywords

    @cached_property
    def authors(self):
        authors: list[str] = []
        if (biblstruct_tag := self.biblstruct_tag) is not None:
            if (analytic := biblstruct_tag.analytic) is not None:
                for author in analytic.find_all("author"):
                    full_name = ""
                    if (forename_tag := author.find("forename")) is not None:
                        full_name += forename_tag.text
                    if (surname_tag := author.find("surname")) is not None:
                        full_name += " " + surname_tag.text

                    ents = self.__model(full_name).ents
                    if ents and ents[0].label_ == "PERSON":
                        authors.append(full_name)

        print(authors)


    def clean_string(self, s: str):
        if s == "":
            return s

        s = s.strip()

        while s and not s[0].isalpha():
            s = s[1:]

        return s.capitalize()
