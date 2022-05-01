import MLA8Citation from "./mla8_citation";
import { $, API } from "../constants";
import makeWordCloudCanvas from "./wordcloud";
import { UploadResponse } from "../models/api";
import { renderPDF } from "./PDFRenderer";
import { createAlert, Icon, Variant } from "./alert";
import { SlDivider, SlTooltip } from "@shoelace-style/shoelace";
import { makeIconGrid, makeReferenceList } from "./references";
import setupImradDetails from "./imrad";
import makeKeywordTags from "./keywords";
import { AuthorDetails, truncateAuthors, TRUNCATION_STRING } from "./author";

/**
 * Resets form and sets the text to default state.
 */
export function resetForm(): void {
  ($("upload-form") as HTMLFormElement).reset();
  ($("pdfpicker-file") as HTMLInputElement).disabled = false;
  $("upload-skeleton").setAttribute("effect", "none");
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


      // Key Words
      const keyWordsDiv = $("key-words");
      makeKeywordTags(article.keywords).forEach((tag) =>
        keyWordsDiv.appendChild(tag)
      );

      // Summary
      $("summary-return-display").textContent = data.summary.join(" ");
      const sos = $("size-of-summary") as HTMLInputElement;
      sos.disabled = false;

      // Word cloud
      $("word-cloud-return-display").appendChild(
        makeWordCloudCanvas(data.common_words)
      );

      // TODO: Return list of tuples by default
      const phrases = [];
      for (const [phrase, rank] of Object.entries(data.phrase_ranks)) {
        phrases.push([phrase, rank]);
      }
      $("word-cloud-return-display").appendChild(makeWordCloudCanvas(phrases));

      // Metadata
      const bibliography = new MLA8Citation(article.bibliography);

      // Article ids
      const articleIDsDiv = $("article-ids");
      const articleIDsDivNew = makeIconGrid(article.bibliography.ids);
      articleIDsDivNew.id = "article-ids";
      articleIDsDiv.replaceWith(articleIDsDivNew);

      $("title-return-display").textContent = bibliography.title;
      if (bibliography.date) {
        const dateTooltip = $("date-tooltip") as SlTooltip;
        dateTooltip.content = bibliography.date;
        dateTooltip.disabled = false;
      }

      // Authors
      const authors = truncateAuthors(bibliography.authors, 3);
      const authorsHeading = $("authors-return-display");
      authors.forEach((authorName, index, array) => {
        if (authorName == TRUNCATION_STRING && index === array.length - 1) {
          authorsHeading.append(TRUNCATION_STRING);
        } else {
          const anchor = document.createElement("a");
          anchor.href = "javascript:;";
          anchor.innerText = authorName;
          authorsHeading.append(anchor);
          anchor.addEventListener("click", () => {
            const authorObj = new AuthorDetails(
              article.bibliography.authors[index]
            );
            authorObj.showAuthorDialog();
          });
        }

        if (index < array.length - 1) {
          const divider = document.createElement("sl-divider") as SlDivider;
          divider.vertical = true;

          authorsHeading.append(divider);
        }
      });

      setupImradDetails(article.sections);

      // References
      const oListEl = makeReferenceList(article.citations);
      $("references-return-display").append(oListEl);
    })
    .catch((e) => {
      console.error(e);
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
