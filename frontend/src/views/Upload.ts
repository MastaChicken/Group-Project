import AbstractView from "./AbstractView";
import { $ } from "../constants";
import { validateURL, uploadPDF } from "../modules/api";
import { dropHandler, dragOverHandler } from "../modules/drag_drop";
import { isValidPDF } from "../modules/pdf";

export default class extends AbstractView {
  constructor() {
    super();
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

  setupListeners() {
    $("pdfpicker-file").addEventListener(
      "change",
      () => {
        const fileElem = $("pdfpicker-file") as HTMLInputElement;
        const files = fileElem.files;
        const dropText = $("drop-text");
        // checks file exists and passes PDF checks.

        if (files.length > 0 && isValidPDF(files[0])) {
          dropText.innerHTML = `File accepted: ${files[0].name}`;
          $("selection-boxes").style.display = "block";
        } else {
          // throws alert for wrong file type
          fileElem.value = "";
          dropText.innerHTML = "File Rejected: Please add .pdf file type";
          $("selection-boxes").style.display = "none";
        }
      },
      false
    );
    // Upload PDF form
    const uploadForm = $("upload-form");
    uploadForm.addEventListener("submit", (ev) => {
      history.pushState(null, null, "/display");
      uploadPDF(ev);
    });

    // Upload URL
    const urlInput = $("url-input");
    urlInput.addEventListener("click", validateURL);

    // Drophandler
    const dropZone = $("drop-zone");
    dropZone.addEventListener("drop", (ev) => dropHandler(ev));
    dropZone.addEventListener("dragover", (ev) => dragOverHandler(ev));
  }
}
