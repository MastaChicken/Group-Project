import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Upload");
  }

  async getHtml() {
    return `
    <body>
    
    <div class="main">

      <h1>Content Visualisation</h1>
      <div class="tab-contents">
        <form id="upload-form" >
          <div id="drop-zone">
            <label for="pdfpicker-file" id="drop-text">
              Drop your .pdf files here!</label
            >
            <br />
            <input
              required
              type="file"
              name="file"
              id="pdfpicker-file"
              accept=".pdf"
              style="display: none"
            />
          </div>

          <div class="tab-contents url-form" required style="display: none">
            <label for="pdfpicker-url"
              >URL :
              <input type="text" id="pdfpicker-url" />
            </label>
          </div>

          <div
            class="tab-contents"
            id="selection-boxes"
            style="display: none"
          ></div>
          <div class="buttons">
            <input
              class="tab-contents"
              type="submit"
              name="submit-upload"
              value="Upload"
            />
            <!-- Button below for implementing URL -->
            <input
              class="tab-contents"
              id="url-input"
              type="submit"
              name=""
              value="Upload URL"
              style="display: none"
            />
          </div>
        </form>
      </div>
    </div>
  </body>
        `;
  }
}
