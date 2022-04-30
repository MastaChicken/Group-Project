import AbstractView from "./AbstractView";
import { $, html } from "../constants";
import { setupListeners as setupPDFListeners } from "../modules/PDFRenderer.js";
import { uploadResponse } from "../modules/api";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Display");
  }

  getHtml() {
    return html`
    
      <div class="tab-contents output-display">
        <div style="display: none" id="loading-screen">
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
        <div id="header"> 
        <sl-button id="home-button">Upload a new PDF!</sl-button>
        <sl-tooltip id="date-tooltip" content="No date to display">
          <h1 id="title-return-display">Content Visualisation</h1>
        </sl-tooltip>
          <h4 id="authors-return-display"></h4>
        </div>
        <sl-dialog class="dialog-overview" id="author-modal">
          <div class="modal-content">
            <p id="modal-content"></p>
          </div>
          <sl-button slot="footer" variant="primary">Close</sl-button>
        </sl-dialog>
        <div id="output-main">
          <div id="pdf-renderer">
            <div id="my_pdf_viewer">
              <div id="navigation_controls">
                <sl-icon-button
                  name="chevron-double-left"
                  class="show-hide-pdf"
                ></sl-icon-button>

                <sl-button id="go_previous">Prev</sl-button>
                <sl-input
                  id="current_page"
                  value="1"
                  type="number"
                  inputMode="numeric"
                  valueAsNumber
                ></sl-input>
                <sl-button id="go_next">Next</sl-button>

                <sl-icon-button
                  name="dash-lg"
                  disabled
                  id="zoom_out"
                ></sl-icon-button>
                <label id="zoom_label">100%</label>
                <sl-icon-button name="plus-lg" id="zoom_in"></sl-icon-button>
              </div>
              <div id="canvas_container"></div>
            </div>
          </div>
          <div>
            <div id="show-pdf-div">
              <sl-icon-button
                name="chevron-double-right"
                class="show-hide-pdf"
              ></sl-icon-button>
              <sl-divider id="show-button-divider" vertical></sl-divider>
            </div>
          </div>
          <div id="summary-container">
            <div id="summary-info" class="summary-boxes">
              <div id="key-words"></div>
              <sl-details summary="WORDCLOUD">
                <div
                  id="word-cloud-return-display"
                  class="output-box-info"
                ></div>
              </sl-details>
              <div id="imrad"></div>
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
                <div id="summary-slider">
                
                  
                  <sl-range
                    min="10"
                    max="100"
                    value="100"
                    step="10"
                    class="slider"
                    id="size-of-summary"
                  ></sl-range>
                </div>
                <sl-divider></sl-divider>
                <div id="summary-return-display">
                  <div id="skele_load"> 
                    <sl-skeleton effect="pulse"></sl-skeleton>
                    <sl-skeleton effect="pulse"></sl-skeleton>
                    <sl-skeleton effect="pulse"></sl-skeleton>
                    <sl-skeleton effect="pulse"></sl-skeleton>
                    <sl-skeleton effect="pulse"></sl-skeleton>
                    <sl-skeleton effect="pulse"></sl-skeleton>
                    <sl-skeleton effect="pulse"></sl-skeleton>
                    <sl-skeleton effect="pulse"></sl-skeleton>
                    <sl-skeleton effect="pulse"></sl-skeleton>
                    <sl-skeleton effect="pulse"></sl-skeleton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupListeners() {
    const sos = $("size-of-summary") as HTMLInputElement;
    sos.disabled = true;

    sos.addEventListener(
      "sl-change",
      () => {
        // $("sos-lbl").innerHTML = `Size of Summary: ${sos.value}%`;

        if (sos.textContent != null) {
          const data = uploadResponse;
          const length = data.summary.length;
          const multiplier = parseInt(sos.value) / 100;

          const adjusted_length = Math.floor(length * multiplier);
          const summary = data.summary.slice(0, adjusted_length).join(" ");
          $("summary-return-display").textContent = summary;
        }
      },
      true
    );

    const homeButton = document.getElementById("home-button");
    homeButton.addEventListener("click", () => {
      history.pushState(null, null, "/");
    });

    const skeleDivs = document.getElementsByTagName("sl-skeleton");
    for (let i = 0; i < skeleDivs.length; i++) {
      skeleDivs[i].style.width =
        Math.floor(Math.random() * (100 - 70 + 1) + 70).toString() + "%";
    }

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
