import AbstractView from "./AbstractView";
import { $, html } from "../constants";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Display");
  }

  getHtml() {
    return html`
      <div class="tab-contents output-display">
        <div id="output-main">
          <div id="pdf-renderer">
            <h2>PDF RENDERER</h2>
          </div>
          <div id="summary-info" class="summary-boxes">
            <div class="output-boxes" id="title-output">
              <h2>TITLE</h2>
              <div
                id="title-return-display"
                class="output-box-info"
                style="display: none"
              >
                <p></p>
              </div>
            </div>
            <div class="output-boxes" id="metadata-output">
              <h2>METADATA</h2>
              <div
                id="metadata-return-display"
                class="output-box-info"
                style="display: none"
              >
                <p></p>
              </div>
            </div>
            <div class="output-boxes" id="toc-output">
              <h2>TABLE OF CONTENTS</h2>
              <div
                id="toc-return-display"
                class="output-box-info"
                style="display: none"
              ></div>
            </div>
            <div class="output-boxes" id="summary-output">
              <h2>SUMMARY</h2>
              <div
                id="summary-return-display"
                class="output-box-info"
                style="display: none"
              ></div>
            </div>
            <div class="output-boxes" id="common-words-output">
              <h2>TOP 10 WORDS</h2>
              <div
                id="common-words-return-display"
                class="output-box-info"
                style="display: none"
              ></div>
            </div>
            <div class="output-boxes" id="references-output">
              <h2>REFERENCES</h2>
              <div
                id="references-return-display"
                class="output-box-info"
                style="display: none"
              ></div>
            </div>
          </div>
        </div>
        <label id="output-show-document-label" for="output-show-document"
          >Show PDF Document?
          <input
            type="checkbox"
            name="output-show-document"
            id="output-show-document"
            checked
          />
        </label>
        <label for="tables-and-figures"> Tables and Figures</label>
        <input
          type="checkbox"
          id="tables-and-figures"
          name="tables-and-figures"
        />
        <label for="size-of-summary" id="sos-lbl"> Size of Summary: 100%</label>
        <input
          type="range"
          min="0"
          max="100"
          value="100"
          step="10"
          class="slider"
          id="size-of-summary"
        />
      </div>
        `;
  }

  setupListeners() {
    const sos = $("size-of-summary") as HTMLInputElement;
    sos.addEventListener(
      "change",
      () => {
        $("sos-lbl").innerHTML = `Size of Summary: ${sos.value}%`;
      },
      true
    );

    // Toggle PDF
    const pdfToggleInput = $("output-show-document");
    // TODO: use event to check if its toggled or not
    pdfToggleInput.addEventListener("change", togglePDFDisplay);

    // Output display
    const outputBoxes = document.querySelectorAll(".output-boxes");

    outputBoxes.forEach((box) => box.addEventListener("click", toggleOpen));

    /***********************************************FOR THE OUTPUT DISPLAY*******************************************************/

    /**
     * Toggles adding the open css class to a div.
     */
    function toggleOpen() {
      this.classList.toggle("open");
    }

    /**
     * Toggle whether the pdf renderer is being displayed or not. If it is not displayed then then changes grid template to
     * one column as opposed to 2 and vice versa.
     */
    function togglePDFDisplay() {
      $("pdf-renderer").style.display =
        $("pdf-renderer").style.display == "none" ? "block" : "none";
      $("output-main").style.gridTemplateColumns =
        $("output-main").style.gridTemplateColumns == "1fr" ? "1fr 1fr" : "1fr";
    }
  }
}
