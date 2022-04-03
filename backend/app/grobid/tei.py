from datetime import datetime

from app.grobid.models.affiliation import Affiliation
from app.grobid.models.article import Article
from app.grobid.models.author import Author
from app.grobid.models.citation import Citation
from app.grobid.models.person_name import PersonName
from bs4 import BeautifulSoup
from bs4.element import Tag
from dateutil.parser import ParserError
from dateutil.parser import parse as date_parse
from spacy.language import Language

from app.grobid.models.scope import Scope


# TODO: use DOI from PyMuPDF to cache XML
class TEI:
    __soup: BeautifulSoup
    __model: Language
    __accepted_entities = {"GPE", "ORG", "PERSON"}

    def __init__(self, stream: bytes, model: Language) -> None:
        self.__soup = BeautifulSoup(stream, "lxml")
        self.__model = model

    def parse(self) -> Article | None:
        if (source := self.__soup.find("sourcedesc")) is None:
            return
        biblstruct_tag = source.find("biblstruct")
        if type(biblstruct_tag) is not Tag:
            return

        bibliography = self.citation(biblstruct_tag)
        keywords = self.keywords(self.__soup.keywords)

        listbibl_tag = self.__soup.find("listbibl")
        if type(listbibl_tag) is not Tag:
            return

        citations = {}
        for struct_tag in listbibl_tag.find_all("biblstruct"):
            if type(struct_tag) is Tag:
                name = struct_tag.get("xml:id")
                citations[name] = self.citation(struct_tag)

        return Article(
            bibliography=bibliography,
            keywords=keywords,
            citations=citations,
        )

    def citation(self, source_tag: Tag) -> Citation:
        citation = Citation(title=self.title(source_tag))
        citation.authors = self.authors(source_tag)
        citation.doi = self.doi(source_tag)
        citation.date = self.date(source_tag.date)
        citation.ptr = self.ptr(source_tag)
        citation.publisher = self.publisher(source_tag)
        citation.scope = self.scope(source_tag)

        return citation

    def title(self, source_tag: Tag | None) -> str:
        title: str = ""
        if source_tag is not None:
            if (title_tag := source_tag.title) is not None:
                title = title_tag.text

        return title

    def ptr(self, source_tag: Tag | None) -> str | None:
        # TODO: validate URL
        if source_tag is not None:
            if (ptr_tag := source_tag.ptr) is not None:
                if "target" in ptr_tag.attrs:
                    return ptr_tag.attrs["target"]

    def doi(self, source_tag: Tag | None) -> str | None:
        if source_tag is not None:
            doi_tag = source_tag.find("idno", {"type": "DOI"})
            if doi_tag is not None:
                return doi_tag.text

    def keywords(self, source_tag: Tag | None) -> set[str]:
        keywords: set[str] = set()

        if source_tag is not None:
            for term_tag in source_tag.find_all("term"):

                doc = self.__model(term_tag.text)
                for keyword in doc.noun_chunks:
                    keywords.add(self.clean_string(keyword.text))

        return keywords

    def publisher(self, source_tag : Tag | None) -> str | None:
        if source_tag is not None:
            if (publisher_tag := source_tag.find("publisher")) is not None:
                return publisher_tag.text


    def date(self, source_tag) -> datetime | None:
        published: datetime | None = None
        if source_tag is not None and "when" in source_tag.attrs:
            try:
                published = date_parse(source_tag["when"])
            except (ParserError, OverflowError):
                pass

        return published

    def scope(self, source_tag: Tag | None) -> Scope | None:
        if source_tag is not None:
            scope = Scope()
            for scope_tag in source_tag.find_all("biblscope"):
                match scope_tag.attrs["unit"]:
                    case "page":
                        try:
                            if "from" in scope_tag.attrs and "to" in scope_tag.attrs:
                                from_page = int(scope_tag["from"])
                                to_page = int(scope_tag["to"])
                            else:
                                from_page = int(scope_tag.text)
                                to_page = from_page

                            scope.pages = (from_page, to_page)
                        except ValueError:
                            pass
                    case "volume":
                        try:
                            volume = int(scope_tag.text)
                            scope.volume = volume
                        except ValueError:
                            pass


            return scope



    def authors(self, source_tag: Tag | None) -> list[Author]:
        authors: list[Author] = []
        if source_tag is not None:
            for author in source_tag.find_all("author"):
                author_obj: Author | None = None
                if (persname := author.find("persname")) is not None:
                    if (surname_tag := persname.find("surname")) is not None:
                        person_name = PersonName(surname=surname_tag.text)
                        if forename_tag := persname.find("forename", {"type": "first"}):
                            person_name.first_name = forename_tag.text

                        # Use NER to check if it is a name
                        ents = self.__model(person_name.to_string).ents
                        if ents and ents[0].label_ in self.__accepted_entities:
                            author_obj = Author(person_name=person_name)
                            authors.append(author_obj)

                if author_obj is not None:
                    if email_tag := author.find("email"):
                        author_obj.email = email_tag.text

                    for affiliation_tag in author.find_all("affiliation"):
                        affiliation_obj = Affiliation()
                        for orgname_tag in affiliation_tag.find_all("orgname"):
                            match orgname_tag["type"]:
                                case "institution":
                                    affiliation_obj.institution = orgname_tag.text
                                case "department":
                                    affiliation_obj.department = orgname_tag.text
                                case "laboratory":
                                    affiliation_obj.laboratory = orgname_tag.text

                        author_obj.affiliations.append(affiliation_obj)

        return authors

    @staticmethod
    def clean_string(s: str) -> str:
        if s == "":
            return s

        s = s.strip()

        while s and not s[0].isalpha():
            s = s[1:]

        return s.capitalize()
