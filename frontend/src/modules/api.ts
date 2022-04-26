import MLA8Citation from "./mla8_citation";
import { $, API } from "../constants";
import makeWordCloudCanvas from "./wordcloud";
import { UploadResponse } from "../models/api";
import { renderPDF } from "../modules/PDFRenderer";

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
    .then(handleNetwork)
    .then(handleErrors)
    .then((response) => response.json())
    .then((response) => response.status)
    .catch((e) => {
      checkUrlErrorMessage(e.message);
    });

  return code == 200;
}

function checkUrlErrorMessage(code: number) {
  let displayMessage = "Something went wrong. Please try again later.";
  if (code == 415) {
    displayMessage = "Link isn't a PDF";
  } else if (code == 500) {
    displayMessage = "Internal server error, i.e. URL is invalid";
  }
  alert(displayMessage);
  history.pushState(null, null, "/");
}

/**
 * Handle non-network errors
 *
 * @param response - response state from fetch call.
 * @returns response
 * @throws {Error}
 */
function handleErrors(response: Response): Response {
  if (!response.ok) throw new Error(response.status.toString());
  return response;
}

function handleNetwork(response: Response): Response {
  if (response.status >= 400 && response.status <= 600) {
    throw new Error(response.status.toString());
  }
  return response;
}

function checkUploadErrorMessage(code: number) {
  console.log(code);
  let displayMessage = "Something went wrong. Please try again later.";
  if (code == 400) {
    displayMessage = "PDF could not be parsed into Article object";
  } else if (code == 415) {
    displayMessage = "PDF could not be read";
  } else if (code == 500) {
    displayMessage =
      "Internal server error, i.e. Article object couldn't be serialised";
  } else if (code == 503) {
    displayMessage = "GROBID API returned an error or is down";
  }
  alert(displayMessage);
  history.pushState(null, null, "/");
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
    .then(handleNetwork)
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
      checkUploadErrorMessage(e.message);
    });
}
