import MLA8Citation from "./mla8_citation";
import { $, API } from "../constants";
import makeWordCloudCanvas from "./wordcloud";
import { UploadResponse } from "../models/api";
import { renderPDF } from "../modules/PDFRenderer";

/**
 * Resets form and sets the text to default state.
 */
export function resetForm(): void {
  ($("upload-form") as HTMLFormElement).reset();
  $("pdfpicker-text").style.display = "none";
  $("pfdpicker-text-default").style.display = "block";
}

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
    .then(handleErrors)
    .then((response) => response.json())
    .then((response) => response.status)
    .catch((e) => {
      checkUrlErrorMessage(e.message);
    });

  return code == 200;
}

// TODO: depreciate
function checkUrlErrorMessage(code: number) {
  let displayMessage = "Something went wrong. Please try again later.";
  if (code == 415) {
    displayMessage = `${code}\nThe file type of the web request is not supported.`;
  } else if (code == 500) {
    displayMessage = `${code}\nThe server encountered an internal error.`;
  }
  alert(displayMessage);
  resetForm();
}

/**
 * Handle fetch errors
 *
 * @param response - response object from fetch call.
 * @returns response
 * @throws response object
 */
function handleErrors(response: Response): Response {
  if (response.ok) {
    return response;
  }

  throw response;
}

/**
 * Displays /upload endpoint error
 *
 * @param response can be a generic Error
*/
function displayUploadError(response: Response | Error): void {
  const uploadCodesMap = {
    400: "PDF isn't a scholarly article",
    415: "PDF file is broken",
    500: "Unexpected error",
    503: "The service you requested is not available at this time",
  };

  let errorMessage = "Server is down. Try again later.";
  if (response instanceof Response) {
    if (response.status in uploadCodesMap) {
      errorMessage = uploadCodesMap[response.status];
    }
  }
  alert(errorMessage);
  resetForm();
}

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
    .then(handleErrors)
    .then((r) => r.json())
    .then((data: UploadResponse) => {
      history.pushState(null, null, "/display");
      const fileReader = new FileReader();
      fileReader.onload = function () {
        renderPDF(this.result);
      };
      fileReader.readAsArrayBuffer(file);
      const article = data.article;

      // Summary
      $("summary-return-display").textContent = data.summary.join(" ");

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
      displayUploadError(e);
    });
}
