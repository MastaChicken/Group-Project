import AbstractView from "./AbstractView";
import { $, html } from "../constants";
import { validateURL, uploadPDF } from "../modules/api";
import { dropHandler, dragOverHandler } from "../modules/drag_drop";
import { isValidPDF } from "../modules/pdf";
import { SlDialog } from "@shoelace-style/shoelace";

export default class extends AbstractView {
  headingCenter = $("header-center") as HTMLDivElement;
  headingLeft = $("header-left") as HTMLDivElement;

  constructor() {
    super();
    this.setTitle("Upload");
    const headingEl = document.createElement("h1");
    headingEl.innerText = "SummarEase";
    const subHeadingEl = document.createElement("h4");
    subHeadingEl.innerText =
      "The easiest scholarly article summariser on the internet!";
    this.headingCenter.replaceChildren(...[headingEl, subHeadingEl]);

    this.headingLeft.replaceChildren();
  }

  getHtml() {
    return html`
    <div class="form-center">
        <form id="upload-form">

          <div id="drop-zone">
          <sl-skeleton id="upload-skeleton" effect="none"></sl-skeleton>
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
      <div class="help-buttons">
      <sl-button id="manual-button" size="large">
      <sl-icon slot="prefix" name="journal-text"></sl-icon>
      Manual
      </sl-button>
      <sl-button id="faq-button" size="large">
      <sl-icon slot="prefix" name="chat-square-quote"></sl-icon>
      FAQ
      </sl-button>
      </div>
      <sl-dialog id="help-dialog">
      </sl-dialog>
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
          $("upload-skeleton").setAttribute("effect", "sheen");
          pdfpickerInput.disabled = true;
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

    // Help dialogs
    const dialog = $("help-dialog") as SlDialog;
    const manualButton = $("manual-button");
    const faqButton = $("faq-button");

    const manualMap: {[key: string]: Array<string>} = {
      "Use the file upload to add your scholarly articles (ensure it is a PDF)":
        [],
      "Wait a few seconds so we can process your PDF": [],
      "Once the PDF is processed, you will be directed to the display screen":
        [],
      "The display screen contains (left to right):": [
        "A collapsible PDF renderer",
        "Expandable author names",
        "Document identifier links",
        "A word cloud",
        "A phrase cloud",
        "Reference list",
        "An excellent summary",
      ],
      "Use the back button on the top left to upload a new PDF": [],
    };
    const manualLen = Object.keys(manualMap).length;
    manualButton.addEventListener("click", () => {
      dialog.label = "Manual";
      const oList = document.createElement("ol");
      Object.entries(manualMap).forEach(([step, subSteps], idx) => {
        const listItem = document.createElement("li");
        listItem.innerText = step;
        if (subSteps) {
          const uList = document.createElement("ul");
          subSteps.forEach((v) => {
            const subListItem = document.createElement("li")
            subListItem.innerText = v;
            uList.appendChild(subListItem)
          })
          listItem.appendChild(uList)
        }
        oList.appendChild(listItem);
        if (idx < manualLen - 1) {
          oList.appendChild(document.createElement("sl-divider"));
        }
      });
      dialog.replaceChildren(oList);
      dialog.show();
    });
    const qAndAMap = {
      "Why can't I select some dropdowns on the summary page?":
        "The PDF may not include the IMRaD sections explicitely, so they will be disable if we aren't able to extract them.",
      "My PDF isn't being summarised?":
        "This could be a number of issues. The PDF file may be broken or the server may be down. Contact support if the issue persists.",
    };
    const qAndALen = Object.keys(qAndAMap).length;
    faqButton.addEventListener("click", () => {
      dialog.label = "FAQ";
      const descList = document.createElement("dl");
      Object.entries(qAndAMap).forEach(([q, a], idx) => {
        const descTerm = document.createElement("dt");
        descTerm.innerText = q;
        descList.appendChild(descTerm);
        const descDetails = document.createElement("dd");
        descDetails.innerText = a;
        descList.appendChild(descDetails);
        if (idx < qAndALen - 1) {
          descList.appendChild(document.createElement("sl-divider"));
        }
      });
      dialog.replaceChildren(descList);
      dialog.show();
    });
  }
}
