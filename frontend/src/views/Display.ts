import AbstractView from "./AbstractView";
import { $, html } from "../constants";
import { setupListeners as setupPDFListeners } from "../modules/PDFRenderer.js";
import { getData } from "../modules/api";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Display");
  }

  getHtml() {
    return html`
      <div class="tab-contents output-display">
        <h1 id="title-return-display"></h1>
        <div id="output-main">
          <div id="pdf-renderer">
            <div id="my_pdf_viewer">
              <div id="canvas_container">
                <canvas id="pdf_renderer"></canvas>
              </div>

              <div id="navigation_controls">
                <button id="go_previous">Previous</button>
                <input id="current_page" value="1" type="number" />
                <button id="go_next">Next</button>
              </div>

              <div id="zoom_controls">
                <button id="zoom_in">+</button>
                <button disabled id="zoom_out">-</button>
              </div>
            </div>
          </div>
          <div id="summary-info" class="summary-boxes">
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
            <div class="output-boxes" id="word-cloud-output">
              <h2>WORDCLOUD</h2>
              <div
                id="word-cloud-return-display"
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
          <div id="summary-output">
            <h2>SUMMARY PAGE</h2>
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
        <input
          type="range"
          min="0"
          max="100"
          value="100"
          step="5"
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
        try {
          if (sos.textContent != null) {
            const data = getData();
            let summary = "";
            const length = data.summary.length;
            const multiplier = sos.valueAsNumber / 100;
            const adjusted_length = Math.floor(length * multiplier);

            for (let i = 0; i < adjusted_length; i++) {
              summary += data.summary[i];
            }
            console.log(summary);
            $("summary-return-display").textContent = summary;
          }
        } catch (error) {
          return;
        }
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
        $("output-main").style.gridTemplateColumns == "1fr" ? "1fr 1fr" : "1fr";
    }
  }
}
