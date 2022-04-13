/** @module MLA8Citation */

/**
 * Represents a document ID and its respective URL
 */
type IDUrl = {
  id: string;
  url: string;
};

/** @class */
export default class MLA8Citation {
  private citation: any;

  constructor(citation: any) {
    this.citation = citation;
  }
  /**
   * @param all - whether it should truncate at 2 authors.
   * Default is false
   * @returns concatenated author strings
   */
  joinAuthors(all = false): string {
    if (all) return this.authors.join(", ");
    if (this.authors.length == 1) return this.authors[0];

    let authorNames = "";
    for (let index = 0; index < this.authors.length; index++) {
      if (index == 2) {
        authorNames += "et al.";
        break;
      }
      authorNames += `${this.authors[index]}, `;
    }

    return authorNames;
  }

  /**
   * @returns Google scholar query link
   */
  googleScholarAnchor(): HTMLAnchorElement {
    const rawDisplayName = this.joinAuthors(true);
    const encodedQuery = encodeURI(
      `${rawDisplayName} "${this.title}". ${this.journal} ${this.volume} ${this.date}`
    );
    const anchorEl = document.createElement("a");
    anchorEl.href = `https://scholar.google.co.uk/scholar?q=${encodedQuery}`;
    anchorEl.text = "Google Scholar";
    anchorEl.target = "_blank";

    return anchorEl;
  }

  // TODO: using string literal is too naive
  /**
   * @returns HTML string structured as an MLA8 Citation entry
   */
  entryHTMLString(): string {
    const displayName = this.joinAuthors();
    return `${displayName} ${this.title} <i>${this.journal}</i> ${this.date} ${this.pages}`;
  }

  /** @returns citation title */
  get title(): string {
    return this.citation.title;
  }

  /** @returns authors full names */
  get authors(): Array<string> {
    const authors: Array<string> = [];
    for (let index = 0; index < this.citation.authors.length; index++) {
      const person_name = this.citation.authors[index].person_name;
      const first_name = person_name.first_name || "";
      const surname = person_name.surname || "";
      authors.push(`${first_name} ${surname}`.trim());
    }
    return authors;
  }

  // NOTE: add to MLA8 citation string
  /** @returns citation publisher (can be empty string) */
  get publisher(): string {
    return this.citation.publisher || "";
  }

  /** @returns  citation journal (can be empty string) */
  get journal(): string {
    return this.citation.journal || "";
  }

  // NOTE: add to MLA8 citation string
  /** @returns  citation series (can be empty string) */
  get series(): string {
    return this.citation.series || "";
  }

  /**
   * Format depends on if there is a range of pages
   *
   * @returns formatted string of pages (can be empty)
   */
  get pages(): string {
    const scope = this.citation.scope;
    if (scope === null) return "";
    const pages = scope.pages;
    if (pages === null) return "";

    if (pages.from_page === pages.to_page) return `p. ${pages.to_page}.`;

    return `pp. ${pages.from_page}-${pages.to_page}.`;
  }

  /** @returns formatted citation volume (can be empty string) */
  get volume(): string {
    const scope = this.citation.scope;
    if (scope === null) return "";
    const volume = scope.volume;
    if (volume === null) return "";

    return `vol. ${volume}`;
  }

  /** @returns formatted citation date (can be empty string) */
  get date(): string {
    let date = this.citation.date;
    if (date === null) return "";
    const year = date.year;
    const month = date.month || "";
    const day = date.day || "";

    date = [year, month, day].join(" ").trim();
    if (date !== "") {
      date += ".";
    }

    return date;
  }

  /** @returns citation target (can be empty string) */
  get target(): string {
    return this.citation.target || "";
  }

  /**
   * Supported types: DOI and arXiv
   *
   * @returns array of {idURL}
   */
  get ids(): IDUrl[] {
    const idUrlArr: IDUrl[] = [];
    const citationIds = this.citation.ids;
    if (citationIds === null) return [];

    if (citationIds.doi != null) {
      idUrlArr.push({
        id: citationIds.doi,
        url: `https://doi.org/${citationIds.citation}`,
      });
    }
    if (citationIds.arxiv != null) {
      idUrlArr.push({
        id: citationIds.arxiv,
        url: `https://arxiv.org/abs/${citationIds.arxiv}`,
      });
    }

    return idUrlArr;
  }
}
