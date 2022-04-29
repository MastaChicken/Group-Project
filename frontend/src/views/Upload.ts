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
    <h1>SummarEase</h1>
    <h4>The easiest scholarly article summariser in the world! Just Drag n Drop your articles and we'll do the rest!</h4>
    <sl-divider></sl-divider>
        <form id="upload-form">
          
          <div id="drop-zone">
          <div id="myProgress">
            <div id="myBar"></div>
          </div>
          <label for="pdfpicker-file">
            <span id="pfdpicker-text-default">
              <a
                id="pdfpicker-link"
                href="javascript:;"
              >
                Click here
              </a>
              or drop your .pdf files here
              </span>
              <span id="pdfpicker-text"></span>
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
        const pdfPickerSpan = $("pdfpicker-text");
        const defPdfPickerSpan = $("pfdpicker-text-default");
        // checks file exists and passes PDF checks.

        if (files.length > 0 && isValidPDF(files[0])) {
          pdfPickerSpan.innerText = `File accepted: ${files[0].name}`;
          loadingBar();

          uploadPDF(files[0]);
        } else {
          // throws alert for wrong file type
          pdfpickerInput.value = "";
          pdfPickerSpan.innerText = "File Rejected: Please add .pdf file type";
        }
        pdfPickerSpan.style.display = "block";
        defPdfPickerSpan.style.display = "none";
      },
      false
    );

    let i = 0;
    function loadingBar() {
      if (i == 0) {
        i = 1;
        let width = 1;
        const frame = () => {
          if (width >= 100) {
            clearInterval(id);
            i = 0;
          } else {
            width++;
            $("myBar").style.width = width + "%";
          }
        };
        const id = setInterval(frame, 10);
      }
    }
    // Upload URL
    const urlInput = $("url-input");
    urlInput.addEventListener("click", validateURL);

    // Drophandler
    const dropZone = $("drop-zone");
    dropZone.addEventListener("drop", (ev) => {
      dropHandler(ev);
    });

    dropZone.addEventListener("dragover", (ev) => dragOverHandler(ev));

    const pdfPickerAnchor = $("pdfpicker-link");
    pdfPickerAnchor.addEventListener("click", () => pdfpickerInput.click());
  }
}
