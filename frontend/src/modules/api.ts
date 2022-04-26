import MLA8Citation from "./mla8_citation";
import { $, API } from "../constants";
import makeWordCloudCanvas from "./wordcloud";
import { UploadResponse } from "../models/api";

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
    console.log(url);
    return false;
  }

  const code = await fetch(
    `${API}/validate_url/?url=${encodeURIComponent(url)}`
  )
    .then(handleErrors)
    .then((response) => response.json())
    .then((response) => response.status)
    .catch((e) => e.message);

  console.log(code);

  return code == 200;
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

function createAuthorModal(author) {
  const modal = $("author-modal") as HTMLElement;
  const emailAnchor = document.createElement("a");
  const mailToString = "mailto: " + author.email;

  emailAnchor.setAttribute("href", mailToString);
  emailAnchor.textContent = author.email;

  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName("close")[0];

  modal.style.display = "block";

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
  span.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

/**
 * Sends request to API with the pdf uploaded to form
 *
 * @param file - pdf file to be uploaded and parsed.
 */
export async function uploadPDF(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  await fetch(`${API}/upload`, { method: "POST", body: formData })
    .then(handleErrors)
    .then((r) => r.json())
    .then((data: UploadResponse) => {
      const article = data.article;

      // Key Words
      const variantArray = [
        "primary",
        "success",
        "neutral",
        "warning",
        "danger",
      ];
      let keywordIndex = 0;
      article.keywords.forEach((keyword) => {
        const badge = document.createElement("sl-tag");
        badge.innerHTML = keyword;
        badge.setAttribute("variant", variantArray[keywordIndex]);
        keywordIndex++;
        $("key-words").appendChild(badge);
      });

      // Abstract
      $("abstract-return-display").textContent =
        article.abstract.paragraphs[0].text;

      // Introduction
      article.sections.forEach((entry) => {
        if (entry.title === "Introduction") {
          entry.paragraphs.forEach((para) => {
            $("intro-return-display").innerHTML += para.text;
            $("intro-return-display").innerHTML += "<br><br>";
          });
          return;
        }
      });

      // Summary
      $("summary-return-display").textContent = data.summary.join(" ");

      // Word cloud
      $("word-cloud-return-display").appendChild(
        makeWordCloudCanvas(data.common_words)
      );

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

      //Conclusion
      article.sections.forEach((entry) => {
        if (entry.title === "Conclusions") {
          entry.paragraphs.forEach((para) => {
            $("conclusion-return-display").innerHTML += para.text;
            $("conclusion-return-display").innerHTML += "<br><br>";
          });
          return;
        }
      });

      console.log(article);
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
    })
    .catch((error) => {
      console.log(error);
    });

  $("output-main").scrollIntoView();
}
