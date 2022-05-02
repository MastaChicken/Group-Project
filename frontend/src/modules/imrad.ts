import { SlDetails } from "@shoelace-style/shoelace";
import { $ } from "../constants";
import { RefText, Section } from "../models/api";
import { showReferenceDialog } from "./references";

const IMRAD = {
  introduction: "introduction-return-display",
  methods: "methods-return-display",
  results: "results-return-display",
  discussion: "results-return-display",
};

/**
 * Adds sections to sl-details if available.
 */
export function setupImradDetails(sections: Section[]): void {
  sections.forEach((section) => {
    const title = section.title.toLowerCase();
    const detailID: string = IMRAD[title];
    if (detailID) {
      const detailEl = $(detailID) as SlDetails;
      detailEl.disabled = false;
      section.paragraphs.forEach((p) => {
        const pTag = embedReferences(p);
        detailEl.appendChild(pTag);
      });
    }
  });
}

/**
 * Embeds references as anchors into paragraph text.
 * @param refText - RefText object
 * @returns Paragraph element representing RefText
 */
function embedReferences(refText: RefText): HTMLParagraphElement {
  const pEl = document.createElement("p");
  let pStr = refText.text;
  const pArr = [];

  // FIXME: add tests for this
  // Current implementation maybe flaky
  let end = 0;
  refText.refs.forEach((ref) => {
    if (ref.marker != null) {
      const anchorEl = document.createElement("a");
      anchorEl.href = "javascript:;";
      anchorEl.onclick = (ev) => {
        ev.preventDefault();
        showReferenceDialog(ref.target);
      };
      anchorEl.innerText = refText.text.slice(ref.start, ref.end);
      pArr.push(pStr.slice(0, ref.start - end));
      pArr.push(anchorEl);
      pStr = pStr.slice(ref.end - end);
      end = ref.end;
    }
  });

  if (pArr) {
    pEl.replaceChildren(...pArr);
  } else {
    pEl.innerHTML = pStr;
  }

  return pEl;
}
