import { SlDetails } from "@shoelace-style/shoelace";
import { $ } from "../constants";
import { Section } from "../models/api";

const IMRAD = {
  "introduction": "introduction-return-display",
  "methods": "methods-return-display",
  "results": "results-return-display",
  "discussion": "results-return-display",
}

export default function setupImradDetails(sections: Section[]): void {
  sections.forEach((section) => {
    const title = section.title.toLowerCase();
    const detailID: string = IMRAD[title];
    if (detailID) {
      const detailEl = $(detailID) as SlDetails;
      detailEl.disabled = false;
      section.paragraphs.forEach((p) => {
        const pTag = document.createElement("p");
        // TODO: add inline references
        pTag.innerText = p.text;
        detailEl.appendChild(pTag)
      });
    }
  });
}
