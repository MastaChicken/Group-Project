import { SlDialog } from "@shoelace-style/shoelace";
import { $ } from "../constants";
import { Author } from "../models/api";

export const TRUNCATION_STRING = "et al."

/**
 * @param authors - list of Author
 * @param n - number of authors to truncate at. Default is 3
 * @returns concatenated author strings
 */
export function truncateAuthors(
  authors: string[],
  n = 3
): string[] {
  if (n == 0 || authors.length == 1) return authors;

  const authorsTrun = [];
  for (const [index, author] of authors.entries()) {
    if (index == n) {
      authorsTrun.push(TRUNCATION_STRING);
      break;
    }
    authorsTrun.push(author);
  }

  return authorsTrun;
}

/** Returns array of author's full names */
export function mapFullname(authors: Author[]): string[] {
  return authors.map((author) => {
    const authorObj = new AuthorDetails(author);
    return authorObj.full_name;
  });
}

export class AuthorDetails {
  private author: Author;
  constructor(author: Author) {
    this.author = author;
  }

  showAuthorDialog(): void {
    const dialog = $("author-dialog") as SlDialog;
    const emailAnchor = document.createElement("a");
    const mailToString = "mailto: " + this.author.email;

    emailAnchor.href = mailToString;
    emailAnchor.textContent = this.author.email;

    // Get the <span> element that closes the modal
    const closeButton = dialog.querySelector('sl-button[slot="footer"]');

    dialog.show();

    $("dialog-content").replaceChildren(...[this.formattedSpan, emailAnchor]);

    // When the user clicks on <span> (x), close the modal
    closeButton.addEventListener("click", () => {
      dialog.hide();
    });
  }

  get formattedSpan(): HTMLSpanElement {
    const span = document.createElement("span");
    span.innerHTML = `${this.full_name}<br>`;
    this.affiliations.forEach((affiliation) => {
      affiliation.forEach((v) => (span.innerHTML += v + "<br>"));
    });
    return span;
  }

  get full_name(): string {
    const person_name = this.author.person_name;
    const first_name = person_name.first_name || "";
    const surname = person_name.surname || "";
    return `${first_name} ${surname}`.trim();
  }

  get email(): string {
    return this.author.email || "";
  }

  /** Return affiliations ordered by ascending importance [laboratory, department, institution] */
  get affiliations(): string[][] {
    const affsArr = [];
    const affiliations = this.author.affiliations;
    if (affiliations == null) return affsArr;

    affiliations.forEach((affiliation) => {
      const affArr = [];
      if (affiliation.laboratory) affArr.push(affiliation.laboratory);
      if (affiliation.department) affArr.push(affiliation.department);
      if (affiliation.institution) affArr.push(affiliation.institution);
      affsArr.push(affArr);
    });

    return affsArr;
  }
}
