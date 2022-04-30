export interface Article {
  bibliography: Citation;
  keywords: string[];
  citations: {
    [k: string]: Citation;
  };
  sections: Section[];
  tables: {
    [k: string]: Table;
  };
  abstract?: Section;
}
/**
 * Represents the <biblStruct> XML tag.
 */
export interface Citation {
  title: string;
  authors?: Author[];
  date?: Date;
  ids?: CitationIDs;
  target?: string;
  publisher?: string;
  journal?: string;
  series?: string;
  scope?: Scope;
}
/**
 * Represents the <author> XML tag.
 */
export interface Author {
  person_name: PersonName;
  affiliations?: Affiliation[];
  email?: string;
}
/**
 * Represents the <persName/> XML tag.
 */
export interface PersonName {
  surname: string;
  first_name?: string;
}
/**
 * Represents the <affiliation> XML tag.
 */
export interface Affiliation {
  department?: string;
  institution?: string;
  laboratory?: string;
}
/**
 * Represents the 'when' attribute in the <date/> XML tag.
 */
export interface Date {
  year: string;
  month?: string;
  day?: string;
}
/**
 * Represents the <idno> XML tag.
 */
export interface CitationIDs {
  doi?: string;
  arxiv?: string;
}
/**
 * Represents the <biblScope/> XML tag.
 */
export interface Scope {
  volume?: number;
  pages?: PageRange;
}
/**
 * Represents the 'to' and 'from' attributes in <biblScope/> XML tag.
 */
export interface PageRange {
  from_page: number;
  to_page: number;
}
/**
 * Represents <div> tag with <head> tag.
 */
export interface Section {
  title: string;
  paragraphs?: RefText[];
}
/**
 * Represents the <p> XML tag.
 *
 * Supports embedded <ref> XML tags.
 */
export interface RefText {
  text: string;
  refs?: Ref[];
}
/**
 * Represents <ref> XML tag.
 *
 * Stores the start and end positions of the reference rather than the text.
 */
export interface Ref {
  start: number;
  end: number;
  target?: string;
  type_?: string;
}
/**
 * Represents the <figure> XML tag of type table.
 */
export interface Table {
  heading: string;
  description?: string;
  rows?: string[][];
}
/**
 * Object used as a response model for /upload endpoint.
 */
export interface UploadResponse {
  article: Article;
  common_words: [string, number][];
  phrase_ranks: [string, number][];
  summary: string[];
}
