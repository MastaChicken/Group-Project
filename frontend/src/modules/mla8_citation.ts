/** @module MLA8Citation */

import { Citation } from "../models/api";
import { mapFullname, truncateAuthors } from "./author";

/** @class */
export default class MLA8Citation {
  private citation: Citation;

  constructor(citation: Citation) {
    this.citation = citation;
  }

  // TODO: using string literal is too naive
  /**
   * @returns HTML string structured as an MLA8 Citation entry
   */
  entryHTMLString(): string {
    const displayName = truncateAuthors(this.authors, 2).join(", ");
    return `${displayName} ${this.title} <i>${this.journal}</i> ${this.date} ${this.pages}`;
  }

  /** @returns citation title */
  get title(): string {
    return this.citation.title;
  }

  /** @returns authors full names */
  get authors(): string[] {
    if (this.citation.authors == null) return [];
    return mapFullname(this.citation.authors);
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

  /**
   * Format depends on if there is a range of pages
   *
   * @returns formatted string of pages (can be empty)
   */
  get pages(): string {
    const scope = this.citation.scope;
    if (scope == null) return "";
    const pages = scope.pages;
    if (pages == null) return "";

    if (pages.from_page === pages.to_page) return `p. ${pages.to_page}.`;

    return `pp. ${pages.from_page}-${pages.to_page}.`;
  }

  /** @returns formatted citation volume (can be empty string) */
  get volume(): string {
    const scope = this.citation.scope;
    if (scope == null) return "";
    const volume = scope.volume;
    if (volume == null) return "";

    return `vol. ${volume}`;
  }

  /** @returns formatted citation date (can be empty string) */
  get date(): string {
    const date = this.citation.date;
    if (date == null) return "";
    const year = date.year;
    const month = date.month || "";
    const day = date.day || "";

    let dateF = [year, month, day].join(" ").trim();
    if (dateF !== "") {
      dateF += ".";
    }

    return dateF;
  }

  /** @returns citation target (can be empty string) */
  get target(): string {
    return this.citation.target || "";
  }
}
