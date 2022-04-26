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
        <div id="loading-screen">
          <div class="lds-roller">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <h1 id="title-return-display">Content Visualisation</h1>
        <h4 id="authors-return-display"></h4>
        <div id="author-modal" class="modal">
          <div class="modal-content">
            <span class="close">&times;</span>
            <p id="modal-content"></p>
          </div>
        </div>
        <div id="output-main">
          <div id="pdf-renderer">
            <div id="my_pdf_viewer">
              <div id="navigation_controls">
                <sl-icon-button name="chevron-double-left" class="show-hide-pdf"></sl-icon-button>

                <sl-button id="go_previous">Prev</sl-button>
                <sl-input id="current_page" value="1" type="number"></sl-input>
                <sl-button id="go_next">Next</sl-button>

                <div>
                <sl-icon-button name="dash-lg" disabled id="zoom_out"></sl-icon-button>
                <label id="zoom_label">100%</label>
                <sl-icon-button name="plus-lg" id="zoom_in"></sl-icon-button>
                </div>
              </div>
              <div id="canvas_container">
                <canvas id="pdf_renderer"></canvas>
              </div>
            </div>
          </div>
          <div>
            <div id="show-pdf-div">
              <sl-icon-button name="chevron-double-right" class="show-hide-pdf"></sl-icon-button>
              <sl-divider id="show-button-divider" vertical></sl-divider>
            </div>
          </div>
          <div id="summary-container">
            <div id="summary-info" class="summary-boxes">
              <div id="key-words"></div>

              <sl-details summary="ABSTRACT">
                <p id="abstract-return-display"></p>
              </sl-details>

              <sl-details summary="INTRODUCTION">
                <p id="intro-return-display"></p>
              </sl-details>

              <sl-details summary="WORDCLOUD">
                <div
                  id="word-cloud-return-display"
                  class="output-box-info"
                ></div>
              </sl-details>

              <sl-details summary="CONCLUSION">
                <p id="conclusion-return-display"></p>
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
            <label for="size-of-summary" id="sos-lbl">
              Size of Summary: 100%</label
            >
            <sl-range
              min="0"
              max="100"
              value="100"
              step="10"
              class="slider"
              id="size-of-summary"
            ></sl-range>
            <sl-switch id="light-dark-switch">Dark</sl-switch>
          </div>
        </div>
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

    const lDSwitch = $("light-dark-switch") as HTMLInputElement;
    lDSwitch.addEventListener("sl-change", () => {
      if (lDSwitch.checked === true) {
        document.body.classList.remove("sl-theme-dark");
        document.body.classList.add("sl-theme-light");
        lDSwitch.innerHTML = "Light";
      } else {
        document.body.classList.remove("sl-theme-light");
        document.body.classList.add("sl-theme-dark");
        lDSwitch.innerHTML = "Dark";
      }
    });

    setupPDFListeners();

    // Toggle PDF
    const divs = document.querySelectorAll(".show-hide-pdf");

    divs.forEach((el) => el.addEventListener("click", togglePDFDisplay));

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
        $("output-main").style.gridTemplateColumns ==
        "minmax(3.6em, 3vw) 48.5vw 48.5vw"
          ? "33.3vw 0vw minmax(15em, 33.3vw) 33.3vw"
          : "minmax(3.6em, 3vw) 48.5vw 48.5vw";
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
