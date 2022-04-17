import AbstractView from "./AbstractView";
import { $, html } from "../constants";
import { validateURL, uploadPDF } from "../modules/api";
import { dropHandler, dragOverHandler } from "../modules/drag_drop";
import { isValidPDF } from "../modules/pdf";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Upload");
  }

  getHtml() {
    return html`

    <div class="tab-contents">
        <form id="upload-form">
          <div id="drop-zone">
          <label for="pdfpicker-file" id="drop-text">
              <a
                id="pdfpicker-link"
                href="javascript:;"
              >
                Click here
              </a>
              or drop your .pdf files here
            </label>
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



    `;
  }

  setupListeners() {
    const pdfpickerInput = $("pdfpicker-file") as HTMLInputElement;
    pdfpickerInput.addEventListener(
      "change",
      () => {
        const files = pdfpickerInput.files;
        const dropText = $("drop-text");
        // checks file exists and passes PDF checks.

        if (files.length > 0 && isValidPDF(files[0])) {
          dropText.innerHTML = `File accepted: ${files[0].name}`;
          $("selection-boxes").style.display = "block";
          history.pushState(null, null, "/display");
          uploadPDF(files[0]);
        } else {
          // throws alert for wrong file type
          pdfpickerInput.value = "";
          dropText.innerHTML = "File Rejected: Please add .pdf file type";
          $("selection-boxes").style.display = "none";
        }
      },
      false
    );

    // Upload URL
    const urlInput = $("url-input");
    urlInput.addEventListener("click", validateURL);

    // Drophandler
    const dropZone = $("drop-zone");
    dropZone.addEventListener("drop", (ev) => {
      dropHandler(ev);
      const files = ($("pdfpicker-file") as HTMLInputElement).files;
      history.pushState(null, null, "/display");
      uploadPDF(files[0]);
    });

    dropZone.addEventListener("dragover", (ev) => dragOverHandler(ev));

    const pdfPickerAnchor = $("pdfpicker-link");
    pdfPickerAnchor.addEventListener("click", () => pdfpickerInput.click());
  }
}
