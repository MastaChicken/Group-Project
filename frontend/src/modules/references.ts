import { SlIconButton } from "@shoelace-style/shoelace";
import { Citation, CitationIDs } from "../models/api";
import { truncateAuthors } from "./author";
import MLA8Citation from "./mla8_citation";

export const IDMap = {
  DOI: {
    target: "https://doi.org/",
    name: "doi-logo",
    alt: "DOI",
  },
  arXiv: {
    target: "https://arxiv/abs/",
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

function IDToIcon(idProps: IDProps, id: string): SlIconButton {
  const anchorEl = document.createElement("sl-icon-button") as SlIconButton;
  anchorEl.href = `${idProps.target}${id}`;
  anchorEl.target = "_blank";
  anchorEl.label = idProps.alt;
  anchorEl.name = idProps.name;
  anchorEl.style.fontSize = "1.5rem";

  return anchorEl;
}

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
