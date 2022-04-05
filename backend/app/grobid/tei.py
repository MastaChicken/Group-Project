# noqa: D100
import string
from typing import Generator

from app.grobid.models import (
    Affiliation,
    Article,
    Author,
    Citation,
    CitationIDs,
    Date,
    PageRange,
    PersonName,
    Ref,
    RefText,
    Scope,
    Section,
)
from bs4 import BeautifulSoup
from bs4.element import CData, NavigableString, PageElement, Tag
from spacy.language import Language


# TODO: use DOI from PyMuPDF to cache XML
class TEI:
    """Methods used to parse TEI XML into serializable objects."""

    __soup: BeautifulSoup
    __model: Language
    __accepted_entities = {"GPE", "ORG", "PERSON"}

    def __init__(self, stream: bytes, model: Language) -> None:
        """Pass the XML stream to BeautifulSoup."""
        self.__soup = BeautifulSoup(stream, "lxml-xml")
        self.__model = model

    def parse(self) -> Article | None:
        """
        Attempt to parse the XML into Article object.

        Parsing is strict (fails if any fields are missing)

        Returns:
            Article object
        """
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
        """
        Parse citation.

        Args:
            source_tag : biblStruct XML Tag

        Returns:
            Citation object
        """
        # NOTE: may return empty string
        citation = Citation(title=self.title(source_tag, attrs={"type": "main"}))
        citation.authors = self.authors(source_tag)
        citation.ids = CitationIDs(
            doi=self.idno(source_tag, attrs={"type": "DOI"}),
            arxiv=self.idno(source_tag, attrs={"type": "arXiv"}),
        )
        citation.date = self.date(source_tag)
        citation.target = self.target(source_tag)
        citation.publisher = self.publisher(source_tag)
        citation.scope = self.scope(source_tag)
        if journal := self.title(source_tag, attrs={"level": "j"}):
            if journal != citation.title:
                citation.journal = journal

        return citation

    def title(self, source_tag: Tag | None, attrs: dict[str, str] = {}) -> str:
        """
        Parse title tag text.

        Args:
            source_tag : XML tag
            attrs: dictionary of filters on attribute values. Default is empty dict.

        Returns:
            Text in title tag if it exists
        """
        title: str = ""
        if source_tag is not None:
            if (title_tag := source_tag.find("title", attrs=attrs)) is not None:
                title = title_tag.text

        return title

    def target(self, source_tag: Tag | None) -> str | None:
        """
        Parse ptr tag target.

        Args:
            source_tag : XML tag

        Returns:
            Target location in ptr tag if it exists
        """
        if source_tag is not None:
            if (ptr_tag := source_tag.ptr) is not None:
                if "target" in ptr_tag.attrs:
                    # TODO: validate URL
                    return ptr_tag.attrs["target"]

    def idno(self, source_tag: Tag | None, attrs: dict[str, str] = {}) -> str | None:
        """
        Parse idno tag.

        Args:
            source_tag : XML tag
            attrs: dictionary of filters on attribute values. Default is empty dict.

        Returns:
            Text content of idno_tag if it exists
        """
        if source_tag is not None:
            if (idno_tag := source_tag.find("idno", attrs=attrs)) is not None:
                return idno_tag.text

    def keywords(self, source_tag: Tag | None) -> set[str]:
        """
        Parse all term tags.

        Uses spaCy model to extract noun chunks.

        Args:
            source_tag : XML tag

        Returns:
            Set of keywords
        """
        keywords: set[str] = set()

        if source_tag is not None:
            for term_tag in source_tag.find_all("term"):

                doc = self.__model(term_tag.text)
                for keyword in doc.noun_chunks:
                    keywords.add(self.clean_title_string(keyword.text))

        return keywords

    def publisher(self, source_tag: Tag | None) -> str | None:
        """
        Parse publisher tag text.

        Args:
            source_tag : XML tag

        Returns:
            Text in publisher tag if it exists
        """
        if source_tag is not None:
            if (publisher_tag := source_tag.find("publisher")) is not None:
                return publisher_tag.text

    def date(self, source_tag: Tag | None) -> Date | None:
        """
        Parse date tag.

        Args:
            source_tag : XML tag

        Returns:
            Date object if date tag is valid
        """
        if source_tag is not None:
            if (date_tag := source_tag.date) is not None:
                if "when" in date_tag.attrs:
                    when = date_tag.attrs["when"]

                    return self.__parse_date(when)

    def __parse_date(self, date: str, sep="-") -> Date | None:
        # Assumes date uses hyphen as separator by default
        tokens = date.split(sep=sep)

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
        """
        Parse all biblScope tags.

        Args:
            source_tag : XML tag

        Returns:
            Scope object if biblScope tags exist
        """
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

                            scope.pages = PageRange(
                                from_page=from_page, to_page=to_page
                            )
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
        """
        Parse all author tags.

        Uses NER to check if the author name is valid.

        Args:
            source_tag : XML tag

        Returns:
            List of Author objects
        """
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
        """
        Parse div tag with head tag.

        Capitalizes title if not already.

        Section can have an empty body.

        Args:
            source_tag : XML tag

        Returns:
            Section object if valid section.
        """
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

    def __text_and_refs(
        self, source_tag: Tag
    ) -> Generator[Tag | PageElement, str, None]:
        # Generator with both strings and ref tags
        types = (NavigableString, CData)
        for descendant in source_tag.descendants:
            if types is None and not isinstance(descendant, NavigableString):
                continue
            descendant_type = type(descendant)
            if isinstance(types, type):
                if descendant_type is not types:
                    continue
            # using type() here mutes pyright error
            elif type(descendant) is Tag and descendant.name == "ref":
                yield descendant
            elif types is not None and descendant_type not in types:
                continue
            else:
                yield descendant

    def ref_text(self, source_tag: Tag | None) -> RefText | None:
        """
        Parse text with ref tags.

        Args:
            source_tag : XML tag

        Returns:
            RefText object
        """
        if source_tag is not None:
            text_and_refs = self.__text_and_refs(source_tag)
            start = 0
            ref_text = RefText(text="")
            for el in text_and_refs:
                start = len(ref_text.text)
                if isinstance(el, Tag):
                    end = start + len(el.text)
                    ref = Ref(start=start, end=end)
                    if (el_type := el.attrs.get("type")) is not None:
                        ref.type = el_type

                    # NOTE: if target[0] is '#', check for citation
                    if (target := el.attrs.get("target")) is not None:
                        ref.target = target

                    ref_text.refs.append(ref)
                else:
                    ref_text.text += str(el)

            return ref_text

    @staticmethod
    def clean_title_string(s: str) -> str:
        """
        Remove non-alpha leading characters from string.

        Args:
            s : title string

        Returns:
            Clean title string
        """
        if s == "":
            return s

        s = s.strip()

        while s and not s[0].isalpha():
            s = s[1:]

        return s.capitalize()
