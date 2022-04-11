/** @module MLA8Citation */

/**
 * @typedef {object} idURL
 * @property {string} id  - ID
 * @property {string} url - URL based on ID
 */

/** @class */
export default class MLA8Citation {
  constructor(citation) {
    this.citation = citation;
  }
  /**
   * @param {boolean} all - whether it should truncate at 2 authors.
   * Default is false
   * @returns {string} - concatenated author strings
   */
  joinAuthors(all = false) {
    if (all) return this.authors.join(", ");
    if (this.authors.length == 1) return this.authors[0];

    var authorNames = "";
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
   * @returns {HTMLAnchorElement} Google scholar query link
   */
  googleScholarAnchor() {
    let rawDisplayName = this.joinAuthors(true);
    let encodedQuery = encodeURI(
      `${rawDisplayName} "${this.title}". ${this.journal} ${this.volume} ${this.date}`
    );
    let anchorEl = document.createElement("a");
    anchorEl.href = `https://scholar.google.co.uk/scholar?q=${encodedQuery}`;
    anchorEl.text = "Google Scholar";
    anchorEl.target = "_blank";

    return anchorEl;
  }

  // TODO: using string literal is too naive
  /**
   * @returns {string} HTML string structured as an MLA8 Citation entry
   */
  entryHTMLString() {
    let displayName = this.joinAuthors();
    return `${displayName} ${this.title} <i>${this.journal}</i> ${this.date} ${this.pages}`;
  }

  /** @returns {string} citation title */
  get title() {
    return this.citation.title;
  }

  /** @returns {Array<string>} authors full names */
  get authors() {
    let authors = [];
    for (let index = 0; index < this.citation.authors.length; index++) {
      const person_name = this.citation.authors[index].person_name;
      let first_name = person_name.first_name || "";
      let surname = person_name.surname || "";
      authors.push(`${first_name} ${surname}`.trim());
    }
    return authors;
  }

  // NOTE: add to MLA8 citation string
  /** @returns  {string} citation publisher (can be empty string) */
  get publisher() {
    return this.citation.publisher || "";
  }

  /** @returns  {string} citation journal (can be empty string) */
  get journal() {
    return this.citation.journal || "";
  }

  // NOTE: add to MLA8 citation string
  /** @returns  {string} citation series (can be empty string) */
  get series() {
    return this.citation.series || "";
  }

  /**
   * Format depends on if there is a range of pages
   *
   * @returns {string} formatted string of pages (can be empty)
   */
  get pages() {
    let scope = this.citation.scope;
    if (scope === null) return "";
    let pages = scope.pages;
    if (pages === null) return "";

    if (pages.from_page === pages.to_page) return `p. ${pages.to_page}.`;

    return `pp. ${pages.from_page}-${pages.to_page}.`;
  }

  /** @returns  {string} formatted citation volume (can be empty string) */
  get volume() {
    let scope = this.citation.scope;
    if (scope === null) return "";
    let volume = scope.volume;
    if (volume === null) return "";

    return `vol. ${volume}`;
  }

  /** @returns  {string} formatted citation date (can be empty string) */
  get date() {
    let date = this.citation.date;
    if (date === null) return "";
    let year = date.year;
    let month = date.month || "";
    let day = date.day || "";

    date = [year, month, day].join(" ").trim();
    if (date !== "") {
      date += ".";
    }

    return date;
  }

  /** @returns  {string} citation target (can be empty string) */
  get target() {
    return this.citation.target || "";
  }

  /**
   * Supported types: DOI and arXiv
   *
   * @returns {idURL[]} - array of {idURL}
   */
  get ids() {
    let idUrlArr = [];
    let citationIds = this.citation.ids;
    if (citationIds === null) return "";

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
