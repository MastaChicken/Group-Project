import MLA8Citation from "./mla8_citation";
import { $, API } from "../constants";
import makeWordCloudCanvas from "./wordcloud";
import { UploadResponse } from "../models/api";
import { renderPDF } from "./PDFRenderer";
import { createAlert, Icon, Variant } from "./alert";

/**
 * Resets form and sets the text to default state.
 */
export function resetForm(): void {
  ($("upload-form") as HTMLFormElement).reset();
  $("pdfpicker-text").style.display = "none";
  $("pfdpicker-text-default").style.display = "block";
}

/**
 * Handle fetch client errors
 *
 * @param response - response object from fetch call.
 * @returns response
 * @throws response object
 */
function handleClientErrors(response: Response): Response {
  if (response.ok) {
    return response;
  }

  throw response;
}

/**
 * Displays error using map
 *
 * @param response - can be a generic Error
 * @param statusMap - map of status codes and error messages
 * @param defaultError - error message that will be shown if status not in map
 */
function displayError(
  response: Response | Error,
  statusMap: Record<number, string>,
  defaultError: string
): void {
  let alertVariant = Variant.danger;
  let alertIcon = Icon.danger;
  let errorMessage = defaultError;
  if (response instanceof Response) {
    if (response.status in statusMap) {
      alertVariant = Variant.warning;
      alertIcon = Icon.warning;
      errorMessage = uploadCodesMap[response.status];
    }
  }

  errorMessage = `<strong>Something went wrong</strong><br/>${errorMessage}`;
  createAlert(errorMessage, alertVariant, alertIcon);
  resetForm();
}

export let uploadResponse: UploadResponse;

/**
 * Represents the documented status codes for /upload endpoint
 */
const uploadCodesMap = {
  400: "PDF isn't a scholarly article",
  415: "PDF file is broken",
  500: "Unexpected error",
  503: "The service you requested is not available at this time",
};

/**
 * Sends request to API with the pdf uploaded to form
 *
 * @param file - pdf file to be uploaded and parsed.
 */
export async function uploadPDF(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  await fetch(`${API}/upload`, {
    method: "POST",
    body: formData,
  })
    .then(handleClientErrors)
    .then((r) => r.json())
    .then((data: UploadResponse) => {
      uploadResponse = data;
      history.pushState(null, null, "/display");
      const fileReader = new FileReader();
      fileReader.onload = function () {
        renderPDF(this.result);
      };
      fileReader.readAsArrayBuffer(file);
      const article = data.article;

      // Summary
      $("summary-return-display").textContent = data.summary.join(" ");
      const sos = $("size-of-summary") as HTMLInputElement;
      sos.disabled = false;

      // Word cloud
      $("word-cloud-return-display").appendChild(
        makeWordCloudCanvas(data.common_words)
      );

      // Metadata
      $("metadata-return-display").textContent = article.bibliography.title;
      // TODO: display the rest of the bibliography

      // References
      const oListEl = document.createElement("ol");
      Object.entries(article.citations).forEach(([ref, citation]) => {
        const citationObj = new MLA8Citation(citation);

        const listEl = document.createElement("li");
        listEl.id = ref;
        let pEl = document.createElement("p");
        pEl.innerHTML = citationObj.entryHTMLString();
        if (citationObj.target) {
          const anchorEl = document.createElement("a");
          anchorEl.href = citationObj.target;
          anchorEl.text = ` ${citationObj.target}`;
          anchorEl.target = "_blank";
          pEl.append(anchorEl);
        }
        listEl.appendChild(pEl);

        // TODO: use a grid of icons instead of paragraphs
        // Show ids
        if (citationObj.ids?.length) {
          pEl = document.createElement("p");
          citationObj.ids.forEach((idUrl) => {
            const anchorEl = document.createElement("a");
            anchorEl.href = idUrl.url;
            anchorEl.text = idUrl.id;
            anchorEl.target = "_blank";
            pEl.append(anchorEl);
          });
          listEl.appendChild(pEl);
        }

        // Google scholar link
        listEl.appendChild(citationObj.googleScholarAnchor());

        oListEl.append(listEl);
      });
      $("references-return-display").append(oListEl);
      $("output-main").scrollIntoView();
    })
    .catch((e) => {
      displayError(e, uploadCodesMap, "Server is down. Please try again later");
    });
}

/**
 * Represents the documented status codes for /validate_url endpoint
 */
const validateUrlCodesMap = {
  415: "Link is not a PDF",
  500: "Unexpected error. Link may be broken",
};

/**
 * Checks url is has .pdf suffix, passes it to backend to get a status response.
 * If response is 200 then it is a valid url
 *
 * @returns Returns true if the URL is valid
 */
export async function validateURL(): Promise<boolean> {
  const url = ($("pdfpicker-url") as HTMLInputElement).value;

  if (!url.endsWith(".pdf")) {
    // TODO: handle this error
    return false;
  }

  const code = await fetch(
    `${API}/validate_url/?url=${encodeURIComponent(url)}`
  )
    .then(handleClientErrors)
    .then((response) => response.json())
    .then((response) => response.status)
    .catch((e) => {
      displayError(
        e,
        validateUrlCodesMap,
        "Server is down. Please try again later"
      );
    });

  return code == 200;
}
