import MLA8Citation from "./mla8_citation";
import { $, API } from "../constants";
import makeWordCloudCanvas from "./wordcloud";
import { UploadResponse, Author, Citation } from "../models/api";
import { renderPDF } from "./PDFRenderer";
import { createAlert, Icon, Variant } from "./alert";
import { SlDialog } from "@shoelace-style/shoelace";

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

function createAuthorModal(author: Author) {
  const modal = $("author-modal") as SlDialog;
  const emailAnchor = document.createElement("a");
  const mailToString = "mailto: " + author.email;

  emailAnchor.setAttribute("href", mailToString);
  emailAnchor.textContent = author.email;

  // Get the <span> element that closes the modal
  const closeButton = modal.querySelector('sl-button[slot="footer"]');

  modal.show();

  // TODO: move this to a class
  // Some of the properties aren't guaranteed to show
  $("modal-content").innerHTML =
    author.person_name.first_name +
    " " +
    author.person_name.surname +
    "<br>" +
    author.affiliations[0].department +
    "<br>" +
    author.affiliations[0].institution +
    "<br>" +
    author.affiliations[0].laboratory +
    "<br>";
  $("modal-content").append(emailAnchor);

  // When the user clicks on <span> (x), close the modal
  closeButton.addEventListener("click", () => {
    modal.hide();
  });
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
      const variantArray = ["primary", "neutral"];
      const variants = variantArray.length;
      let keywordIndex = 0;
      article.keywords.forEach((keyword) => {
        const badge = document.createElement("sl-tag");
        badge.innerText = keyword;
        const variantIndex = keywordIndex % variants;
        badge.setAttribute("variant", variantArray[variantIndex]);
        keywordIndex++;
        $("key-words").appendChild(badge);
      });

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
      $("title-return-display").textContent = article.bibliography.title;
      article.bibliography.authors.forEach((author, id, array) => {
        const a = document.createElement("a");
        const divider = document.createElement("sl-divider");
        divider.setAttribute("vertical", "true");
        const authorString =
          author.person_name.surname + ", " + author.person_name.first_name;
        a.innerText = authorString;
        $("authors-return-display").append(a);
        if (id < array.length - 1) {
          $("authors-return-display").append(divider);
        }

        a.addEventListener("click", function () {
          createAuthorModal(author);
        });
      });

      const imrad = ["introduction", "methods", "results", "discussion"];
      const imradDiv = $("imrad");
      article.sections.forEach((section) => {
        const title = section.title.toLowerCase();
        if (imrad.includes(title)) {
          const details = document.createElement("sl-details");
          details.setAttribute("summary", section.title.toUpperCase());
          section.paragraphs.forEach((p) => {
            const pTag = document.createElement("p");
            // TODO: add inline references
            pTag.innerText = p.text;
            details.appendChild(pTag);
          });
          imradDiv.appendChild(details);
        }
      });
      imradDiv.replaceWith(...imradDiv.childNodes);

      // References
      const oListEl = document.createElement("ol");
      Object.entries(article.citations).forEach(([ref, citation]) => {
        const citationObj = new MLA8Citation(citation);

        const listEl = document.createElement("li");
        listEl.id = ref;

        const logos = document.createElement("div");
        const pEl = document.createElement("p");
        pEl.innerHTML = citationObj.entryHTMLString();
        if (citationObj.target) {
          const anchorEl = document.createElement("a");
          anchorEl.href = citationObj.target;
          anchorEl.target = "_blank";
          const img = document.createElement("img");
          img.src = "DOI_logo.svg";
          img.alt = "DOI";
          img.width = 44;
          img.height = 44;
          anchorEl.append(img);
          logos.append(anchorEl);

          // anchorEl.text = ` ${citationObj.target}`;
          // anchorEl.target = "_blank";

          // pEl.append(anchorEl);
        }
        listEl.appendChild(pEl);

        // Google scholar link
        listEl.appendChild(citationObj.googleScholarAnchor(logos));

        oListEl.append(listEl);
      });
      $("references-return-display").append(oListEl);
      $("output-main").scrollIntoView();
    })
    .catch((e) => {
      displayError(e, uploadCodesMap, "Server is down. Please try again later");
    });
}

// function makeSVG(logos: HTMLElement, citation: Citation) {
//   const target = citation.target;

//   if (citation.ids.arxiv) {
//     const anchorEl = document.createElement("a");
//     anchorEl.href = target;
//     anchorEl.target = "_blank";
//     const img = document.createElement("img");

//     img.src = "264px-ArXiv_web.svg.png";
//     img.alt = "arXiv";
//     img.width = 44;
//     img.height = 44;
//     anchorEl.append(img);
//     logos.append(anchorEl);
//   }
//   if (citation.ids.doi) {
// const anchorEl = document.createElement("a");
// anchorEl.href = target;
// anchorEl.target = "_blank";
// const img = document.createElement("img");

// img.src = "DOI_logo.svg";
// img.alt = "DOI";
// img.width = 44;
// img.height = 44;
// anchorEl.append(img);
// logos.append(anchorEl);
//   }
// }

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
