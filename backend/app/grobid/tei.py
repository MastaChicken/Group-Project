import string
from typing import Generator

from app.grobid.models.affiliation import Affiliation
from app.grobid.models.article import Article
from app.grobid.models.author import Author
from app.grobid.models.citation import Citation
from app.grobid.models.date import Date
from app.grobid.models.person_name import PersonName
from app.grobid.models.ref import Ref
from app.grobid.models.ref_text import RefText
from app.grobid.models.scope import PageRange, Scope
from app.grobid.models.section import Section
from bs4 import BeautifulSoup
from bs4.element import CData, NavigableString, Tag
from spacy.language import Language


# TODO: use DOI from PyMuPDF to cache XML
class TEI:
    __soup: BeautifulSoup
    __model: Language
    __accepted_entities = {"GPE", "ORG", "PERSON"}

    def __init__(self, stream: bytes, model: Language) -> None:
        self.__soup = BeautifulSoup(stream, "lxml-xml")
        self.__model = model

    # NOTE: parsing is strict
    # it should fail only if the sections are missing
    def parse(self) -> Article | None:
        body = self.__soup.body

        if not isinstance(body, Tag):
            return

        sections: list[Section] = []
        for div in body.find_all("div"):
            if (section := self.section(div)) is not None:
                sections.append(section)

        if (source := self.__soup.find("sourceDesc")) is None:
            return
        biblstruct_tag = source.find("biblStruct")
        if not isinstance(biblstruct_tag, Tag):
            return

        bibliography = self.citation(biblstruct_tag)
        keywords = self.keywords(self.__soup.keywords)

        listbibl_tag = self.__soup.find("listBibl")
        if not isinstance(listbibl_tag, Tag):
            return

        citations = {}
        for struct_tag in listbibl_tag.find_all("biblStruct"):
            if isinstance(struct_tag, Tag):
                name = struct_tag.get("xml:id")
                citations[name] = self.citation(struct_tag)

        return Article(
            sections=sections,
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


    def date(self, source_tag) -> Date | None:
        if source_tag is not None and "when" in source_tag.attrs:
                return self.__parse_date(source_tag["when"])

    def __parse_date(self, date: str) -> Date | None:
        tokens = date.split(sep="-")

        match len(tokens):
            case 1:
                year = tokens[0]
                return Date(year)
            case 2:
                year, month = tokens
                return Date(year, month)
            case 3:
                year, month, day = tokens
                return Date(year, month, day)

    def scope(self, source_tag: Tag | None) -> Scope | None:
        if source_tag is not None:
            scope = Scope()
            for scope_tag in source_tag.find_all("biblScope"):
                match scope_tag.attrs["unit"]:
                    case "page":
                        try:
                            if "from" in scope_tag.attrs and "to" in scope_tag.attrs:
                                from_page = int(scope_tag["from"])
                                to_page = int(scope_tag["to"])
                            else:
                                from_page = int(scope_tag.text)
                                to_page = from_page

                            scope.pages = PageRange(from_page=from_page, to_page=to_page)
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
                if (persname := author.find("persName")) is not None:
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

    def section(self, source_tag: Tag | None) -> Section | None:
        """Represents div."""
        if source_tag is not None:
            head = source_tag.find("head")
            if isinstance(head, Tag):
                head_text: str = head.get_text()
                if head.has_attr("n") or head_text[0] in string.ascii_letters:
                    if head_text.isupper() or head_text.islower():
                        head_text = head_text.capitalize()

                section = Section(title=head_text)
                paragraphs = source_tag.find_all("p")
                for p in paragraphs:
                    if p and (ref_text := self.ref_text(p)) is not None:
                        section.paragraphs.append(ref_text)

                return section

    def __text_and_refs(self, source_tag) -> Generator[NavigableString, str, None]:
        types = (NavigableString, CData)
        for descendant in source_tag.descendants:
            if types is None and not isinstance(descendant, NavigableString):
                continue
            descendant_type = type(descendant)
            if isinstance(types, type):
                if descendant_type is not types:
                    continue
            elif descendant_type is Tag and descendant.name == "ref":
                yield descendant
            elif types is not None and descendant_type not in types:
                continue
            else:
                yield descendant

    def ref_text(self, source_tag: Tag | None) -> RefText | None:
        if source_tag is not None:
            text_and_refs = self.__text_and_refs(source_tag)
            start = 0
            ref_text = RefText(text="")
            for el in text_and_refs:
                start = len(ref_text.text)
                if isinstance(el, Tag):
                    end = start + len(el.text)
                    ref = Ref(start=start, end=end)
                    if (type := el.attrs.get("type")) is not None:
                        ref.type = type

                    # NOTE: if target[0] is '#', check for citation
                    if (target := el.attrs.get("target")) is not None:
                        ref.target = target

                    ref_text.refs.append(ref)
                else:
                    ref_text.text += str(el)

            return ref_text


    @staticmethod
    def clean_string(s: str) -> str:
        if s == "":
            return s

        s = s.strip()

        while s and not s[0].isalpha():
            s = s[1:]

        return s.capitalize()
