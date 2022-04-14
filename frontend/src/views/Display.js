import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Display");
  }

  async getHtml() {
    return `
    <body>

    <div class="main">
      <h1>Content Visualisation</h1>

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
    </div>

        `;
  }
}
