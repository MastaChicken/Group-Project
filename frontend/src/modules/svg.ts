import { Citation, CitationIDs } from "../models/api";

export function prepareSVGMaker(logos: HTMLElement, citation: Citation) {
  if (citation.ids == null) {
    return;
  }
  console.log(citation.ids.DOI);
  console.log(citation.ids.arXiv);
  let target = citation.target;

  // Check if last character is a / because if it is then link is incomplete.
  if (target != null) {
    if (target.charAt(target.length - 1) == "/") {
      target = null;
    }
  }
  const id: CitationIDs = citation.ids;

  if (id.DOI) {
    if (target == null) {
      target = `https://doi.org/${id.DOI}`;
    } else {
      target = citation.target;
    }
  } else if (id.arXiv) {
    if (target == null) {
      target = `https://arxiv.org/abs/${id.arXiv}`;
    } else {
      target = citation.target;
    }
  }
  makeSVG(logos, citation.ids, target);
}

function makeSVG(logos: HTMLElement, id: CitationIDs, target: string) {
  const anchorEl = document.createElement("a");

  anchorEl.href = target;
  anchorEl.target = "_blank";
  const img = document.createElement("img");

  if (id.DOI) {
    img.src = "../../public/assets/icons/DOI_logo.svg";
    img.alt = "DOI";
  } else if (id.arXiv) {
    img.src = "../../public/assets/icons/ArXiv_web.svg";
    img.alt = "arXiv";
  }

  img.width = 45;
  img.height = 45;
  anchorEl.append(img);
  logos.append(anchorEl);
}
