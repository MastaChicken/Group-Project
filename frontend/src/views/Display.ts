import AbstractView from "./AbstractView";
import { $, html } from "../constants";
import { setupListeners as setupPDFListeners } from "../modules/PDFRenderer.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Display");
  }

  getHtml() {
    return html`
      <div class="tab-contents output-display">
        <h1 id="title-return-display">Content Visualisation</h1>
        <div id="output-main">
          <div id="pdf-renderer">
            <div id="my_pdf_viewer">
              <div id="canvas_container">
                <canvas id="pdf_renderer"></canvas>
              </div>

              <div id="navigation_controls">
                <sl-button id="go_previous">Previous</sl-button>
                <sl-input id="current_page" value="1" type="number"></sl-input>
                <sl-button id="go_next">Next</sl-button>

                <sl-button name="zoom-in" id="zoom_in">+</sl-button>
                <label id="zoom_label">100%</label>
                <sl-button name="zoom-out" disabled id="zoom_out">-</sl-button>
              </div>
            </div>
          </div>
          <div id="summary-container">
            <div id="summary-info" class="summary-boxes">
              <sl-details summary="METADATA">
                <div id="metadata-return-display" class="output-box-info"></div>
              </sl-details>

              <sl-details summary="WORDCLOUD">
                <div id="word-cloud-return-display" class="output-box-info">
                </div>
              </sl-details>

              <sl-details summary="REFERENCES">
                <div
                  id="references-return-display"
                  class="output-box-info"
                ></div
              ></sl-details>
            </div>
          </div>
          <div id="summary-output">
            <h2>Summary</h2>
            <sl-divider></sl-divider>
            <div id="summary-return-display"></div>
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
        <sl-range
          min="0"
          max="100"
          value="100"
          step="10"
          class="slider"
          id="size-of-summary"
        ></sl-range>
      </div>
    `;
  }

  setupListeners() {
    const sos = $("size-of-summary") as HTMLInputElement;
    sos.addEventListener(
      "sl-change",
      () => {
        $("sos-lbl").innerHTML = `Size of Summary: ${sos.value}%`;
      },
      true
    );

    setupPDFListeners();

    // Toggle PDF
    const pdfToggleInput = $("output-show-document");
    // TODO: use event to check if its toggled or not
    pdfToggleInput.addEventListener("change", togglePDFDisplay);

    // Output display
    const outputBoxes = document.querySelectorAll(".output-boxes");

    outputBoxes.forEach((box) => box.addEventListener("click", toggleOpen));

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
        $("output-main").style.gridTemplateColumns == "1fr 1fr"
          ? "1fr 1fr 1fr"
          : "1fr 1fr";
    }

    const container = document.querySelector(".summary-boxes");

    // Close all other details when one is shown
    container.addEventListener("sl-show", (event) => {
      [...container.querySelectorAll("sl-details")].map(
        (details) => (details.open = event.target === details)
      );
    });
  }
}
