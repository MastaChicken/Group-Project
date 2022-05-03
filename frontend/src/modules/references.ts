import { SlDialog, SlIconButton } from "@shoelace-style/shoelace";
import { $ } from "../constants";
import { Citation, CitationIDs } from "../models/api";
import { truncateAuthors } from "./author";
import MLA8Citation from "./mla8_citation";

/**
 * Supported IDs
 */
export const IDMap = {
  DOI: {
    target: "https://doi.org/",
    name: "doi-logo",
    alt: "DOI",
  },
  arXiv: {
    target: "https://arxiv.org/abs/",
    name: "arxiv-logo",
    alt: "arXiv ID",
  },
  Scholar: {
    target: "https://scholar.google.co.uk/scholar?q=",
    name: "google-scholar-logo",
    alt: "Google Scholar",
  },
};

type IDProps = {
  target: string;
  name: string;
  alt: string;
};

/**
 * Represents ID as a SlIconButton
 */
function IDToIcon(idProps: IDProps, id: string): SlIconButton {
  const anchorEl = document.createElement("sl-icon-button") as SlIconButton;
  anchorEl.href = `${idProps.target}${id}`;
  anchorEl.target = "_blank";
  anchorEl.label = idProps.alt;
  anchorEl.name = idProps.name;
  anchorEl.style.fontSize = "1.5rem";

  return anchorEl;
}

/**
 * Create div element with the supported ids as icons.
 * @param ids - supported ids
 */
export function makeIconGrid(ids: CitationIDs): HTMLDivElement {
  const logos: HTMLDivElement = document.createElement("div");
  if (ids == null) return logos;

  if (ids.DOI) {
    const idProps = IDMap.DOI as IDProps;
    logos.appendChild(IDToIcon(idProps, ids.DOI));
  }

  if (ids.arXiv) {
    const idProps = IDMap.arXiv as IDProps;
    logos.appendChild(IDToIcon(idProps, ids.arXiv));
  }

  return logos;
}

/**
 * Creates ordered list of references
 * @param citations - object with id as key and Citation as value
 * @returns Ordered list of references
 */
export function makeReferenceList(citations: {
  [key: string]: Citation;
}): HTMLOListElement {
  const oListEl = document.createElement("ol");
  Object.entries(citations).forEach(([ref, citation]) => {
    const citationObj = new MLA8Citation(citation);

    const listEl = document.createElement("li");
    listEl.id = ref;
    const pEl = document.createElement("p");
    pEl.innerHTML = citationObj.entryHTMLString();
    if (citationObj.target) {
      const anchorEl = document.createElement("a");
      anchorEl.href = citationObj.target;
      anchorEl.target = "_blank";
      anchorEl.innerText = citationObj.target;
      pEl.appendChild(anchorEl);
    }
    listEl.appendChild(pEl);

    // Supported ID links
    const logosDiv = makeIconGrid(citation.ids);

    // Google scholar link
    const rawDisplayName = truncateAuthors(citationObj.authors, 0);
    const encodedQuery = encodeURI(
      `${rawDisplayName} "${citationObj.title}". ${citationObj.journal} ${citationObj.volume} ${citationObj.date}`
    );
    logosDiv.appendChild(IDToIcon(IDMap.Scholar, encodedQuery));

    listEl.appendChild(logosDiv);

    oListEl.append(listEl);
  });

  return oListEl;
}
/*
 * Use SlDialog to show the reference based on the id
 * @param id - expects the id to have a hash as first character
 */
export function showReferenceDialog(id: string | null): void {
  if (id == null) return void 0;

  const ref = document.querySelector(id);
  if (ref == null) return void 0;

  const dialog = $("display-dialog") as SlDialog;
  dialog.label = "";

  $("dialog-content").replaceChildren(ref);

  dialog.show();

  // Get the <span> element that closes the modal
  const closeButton = dialog.querySelector('sl-button[slot="footer"]');

  // When the user clicks on <span> (x), close the modal
  closeButton.addEventListener("click", () => {
    dialog.hide();
  });
}
