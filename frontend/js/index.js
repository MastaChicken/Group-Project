const $ = (id) => document.getElementById(id);
const API = "http://localhost:8000";
let count = 0;

/**
 * Checks if file is valid .pdf
 *
 * @param {*} file - file input. Type and Name are two parts of the pdf file.
 * @returns {boolean} if PDF is valid
 */
function isValidPDF({ type, name }) {
  if (type === "application/pdf") {
    return true;
  }
  if (type === "" && name) {
    let fileName = name;
    let lastDotIndex = fileName.lastIndexOf(".");
    return !(
      lastDotIndex === -1 ||
      fileName.substr(lastDotIndex).toUpperCase() !== "PDF"
    );
  }
  return false;
}

/**
 * Takes the page count and runs checks to see whether the pages-to-summarise slider should be
 * displayed or not. If page count is equal to 1 then it is not shown as there is no range of pages
 * to be summarised. Else if it is over 1 then it shows the slider and updates the sliders attributes
 * to match the Page count. Finally it updates the label to reflect this.
 *
 * @param {*} c - Passes the count variable. This represents the Page count of the pdf file.
 */
function displaySlider(c) {
  const ptsSlider = $("pages-to-summarise");
  count = c;
  if (count == 1) {
    $("selection-boxes").style.display = "none";
  } else if (count > 1) {
    $("selection-boxes").style.display = "block";
    ptsSlider.max = count;
    ptsSlider.value = count;
    // Then it changes the text for pages to summarise to update with the current value
    // and the max i.e
    $(
      "pts-lbl"
    ).innerHTML = `Pages to Summarise: ${ptsSlider.value} / ${count}`;
  }
}

/**
 * Creates a reader and reads the PDF document. When the file has been read it tries to set count
 * as result match on regex for /Type/Page[x]. If this is successful it calls displaySlider(), else
 * it catches the error, hides the slider and sets count to 0.
 *
 * This is inconsistent so far, as PDFs can be hidden behind multiple layers of obfuscation /
 * compression which affects the documents readability.
 *
 * @param {*} file - The PDF document stored in file input pdfpicker.
 */
function setPagesToSummarise(file) {
  // reads file and function triggers when reader has completed reading.
  let reader = new FileReader();
  reader.readAsBinaryString(file);
  reader.onloadend = () => {
    // let count = number of pages. sets the pages to summarise slider attribute max
    // to the number of pages.
    try {
      let count = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length;
      displaySlider(count);
    } catch (e) {
      $("selection-boxes").style.display = "none";
      count = 0;
    }
  };
}

/**
 * Adds event listeners for the pdfpicker file input, the pages to summarise slider, size of summary slider.
 *
 * The Event Listener for pdfpicker waits for change in the pdfpicker-file. Once detected this then checks
 * the files in input files for being over zero and calls isValidPDF(). If true, then calls
 * setPagesToSymmarise() and changes text in Drag and Drop box.
 *
 * Event for pages-to-summarise slider detects user changing value and updates label accordingly.
 *
 * Event for size-of-summary slider detects user changing value and updates label accordingly.
 */
window.onload = function listenForFileUpload() {
  // Adds event listener to the upload button, so it executes on change.
  $("pdfpicker-file").addEventListener(
    "change",
    () => {
      let files = $("pdfpicker-file").files;
      let dropText = $("drop-text");
      // checks file exists and passes PDF checks.
      if (files.length > 0 && isValidPDF(files[0])) {
        setPagesToSummarise(files[0]);
        dropText.innerHTML = `File accepted: ${files[0].name}`;
        $("selection-boxes").style.display = "block";
      } else {
        // throws alert for wrong file type
        $("pdfpicker-file").value = "";
        dropText.innerHTML = "File Rejected: Please add .pdf file type";
        $("selection-boxes").style.display = "none";
      }
    },
    false
  );

  // adds event listener to the pages to summarise slider, and updates the label text on change
  let ptsValue = $("pages-to-summarise");
  ptsValue.addEventListener(
    "change",
    () => {
      let max = ptsValue.getAttribute("max");
      $("pts-lbl").innerHTML = `Pages to Summarise: ${ptsValue.value} / ${max}`;
    },
    true
  );

  let sos = $("size-of-summary");
  sos.addEventListener(
    "change",
    () => {
      $("sos-lbl").innerHTML = `Size of Summary: ${sos.value}%`;
    },
    true
  );
};

/**
 * Function to monitor when files are dragged over the drag over box.
 * Important to remove browsers default functionality, i.e chrome wants to copy the pdf file into browser and render.
 *
 * @param {*} ev - dragOverHandler event.
 */
function dragOverHandler(ev) {
  console.log("File(s) in drop zone");
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

/**
 * Function for handling drop events. Handles the file transfer from event.datatransfer file to being stored in the input="file".
 * clears dataTransfer data after stored, or determined not valid .pdf filetype.
 *
 * @param {*} ev - dropHandler event.
 */
function dropHandler(ev) {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // If dropped items aren't files, reject them
    if (ev.dataTransfer.items[0].kind === "file") {
      let file = ev.dataTransfer.items[0].getAsFile();
      let dropText = $("drop-text");

      if (isValidPDF(file)) {
        // If file is .pdf adjust the page summary slider and set the file input box as the data files then clear event data.
        // This ensures we are only dealing with 1 file at a time and from the same source, so when sending to backend
        // we only have to target the input file.
        setPagesToSummarise(file);
        dropText.innerHTML = `File accepted: ${file.name}`;
        $("pdfpicker-file").files = ev.dataTransfer.files;
        clearData(ev.dataTransfer);
        $("selection-boxes").style.display = "block";
      } else {
        // If not a valid .pdf Add reject messsage and clear data from file input and event data.
        dropText.innerHTML = "File Rejected: Please add .pdf file type";
        $("pdfpicker-file").value = "";
        clearData(ev.dataTransfer);
        $("selection-boxes").style.display = "none";
      }
    }
  }
}

/**
 * Handles clearing data with check for items.
 *
 * @param {*} data - dataTransfer data.
 */
function clearData(data) {
  if (data.items) {
    // Use DataTransferItemList interface to remove the drag data
    data.items.clear();
  } else {
    // Use DataTransfer interface to remove the drag data
    data.clearData();
  }
}

/**
 * Changes between upload / URL / Summary tabs.
 *
 * @param {*} tabName - Desired tab to switch to.
 * @param {*} className - Class Name for all involved divs. (Think i included this to make it reuseable but may be able to remove this.)
 */
function openTab(tabName, className) {
  /*
  Couldn't get this ES6 version of the code to work properly, so i think something is wrong with it.
  Kept so we can maybe refer to it when updating coding conventions to ES6 later.

  [...document.getElementsByClassName("tab-contents")].forEach(
    ({ style }) => (style.display = "none")); */

  /* For Each element of tab-contents(i.e Upload / URL divs) set display = none */
  var i;
  var tabs = document.getElementsByClassName(className);
  for (i = 0; i < tabs.length; i++) {
    tabs[i].style.display = "none";
  }

  /* Set selected element to be displayed */
  var show = document.getElementsByClassName(tabName);
  for (i = 0; i < show.length; i++) {
    show[i].style.display = "block";
    if (tabName == "upload-form" && count > 1) {
      displaySlider(count);
    }
  }
}

/**
 * Handle non-network errors
 *
 * @param {Response} response - response state from fetch call.
 * @returns {Response} response
 */
function handleErrors(response) {
  if (!response.ok) throw new Error(response.status);
  return response;
}
/**
 * Checks url is has .pdf suffix, passes it to backend to get a status response.
 * If response is 200 then it is a valid url
 *
 * @returns {boolean} Returns true if the URL is valid
 */
async function validateURL() {
  var url = $("pdfpicker-url").value;

  if (!url.endsWith(".pdf")) {
    // TODO: handle this error
    console.log(url);
    return false;
  }

  var code = await fetch(`${API}/validate_url/?url=${encodeURIComponent(url)}`)
    .then(handleErrors)
    .then((response) => response.json())
    .then((response) => response.status)
    .catch((e) => e.message);

  console.log(code);

  return code == 200;
}

/**
 * Sends request to API with the pdf uploaded to form
 *
 * @param {Event} event - only called to prevent default.
 */
async function uploadPDF(event) {
  event.preventDefault();
  const data = new FormData();
  // Add first file in file input, the PDF, as "file"
  data.append("file", event.target.file.files[0]);
  await fetch(`${API}/upload`, { method: "POST", body: data })
    .then(handleErrors)
    .then((r) => r.json())
    .then((data) => {
      $("title-return-display").textContent = data.title;
      $("metadata-return-display").innerHTML = "";
      Object.entries(data.metadata).forEach(([k, v]) => {
        $("metadata-return-display").innerHTML += `<b>${k}:</b> ${v}<br><br>`;
      });
      $("summary-return-display").textContent = data.summary;
      $("toc-return-display").textContent = data.toc;
      $("toc-return-display").innerHTML = "";
      Object.entries(data.toc).forEach(([_, v]) => {
        $("toc-return-display").innerHTML += `${v[1]}<br><br>`;
      });

      $("common-words-return-display").textContent = data.common_words;
      $("common-words-return-display").innerHTML = "";
      Object.entries(data.common_words).forEach(([k, v]) => {
        $(
          "common-words-return-display"
        ).innerHTML += `<b>${k}:</b> ${v}<br><br>`;
      });
    })
    .catch((e) => {
      console.log(e);
    });

  await fetch(`${API}/parse`, { method: "POST", body: data })
    .then(handleErrors)
    .then((r) => r.json())
    .then((data) => {
      const oLinkEl = document.createElement("ol");
      Object.entries(data.citations).forEach(([ref, citation]) => {
        let citationObj = new MLA8Citation(citation);

        let listEl = document.createElement("li");
        listEl.id = ref;
        let pEl = document.createElement("p");
        pEl.innerHTML = citationObj.entryHTMLString;
        if (citationObj.target) {
          let anchorEl = document.createElement("a");
          anchorEl.href = citationObj.target;
          anchorEl.text = ` ${citationObj.target}`;
          anchorEl.target = "_blank";
          pEl.append(anchorEl);
        }
        listEl.appendChild(pEl);

        // TODO: use a grid
        // Show ids
        // if (idUrlArr?.length) {
        //   pEl = document.createElement("p")
        //   idUrlArr.forEach(idUrl => {
        //     let anchorEl = document.createElement("a")
        //     anchorEl.href = idUrl.url
        //     anchorEl.text = idUrl.id
        //     anchorEl.target = "_blank"
        //     pEl.append(anchorEl)
        //   });
        //   listEl.appendChild(pEl)
        // }

        // Google scholar link
        listEl.appendChild(citationObj.googleScholarAnchor);

        oLinkEl.append(listEl);
      });
      $("references-return-display").append(oLinkEl);
    });

  openTab("output-display", "tab-contents");
  $("output-main").scrollIntoView();
  $("summary-link").style.display = "inline-block";
}

class MLA8Citation {
  constructor(citation) {
    this.citation = citation;
  }
  /**
   * @param {boolean} all - whether it should truncate at 2 authors.
   * Default is False
   * @returns {string} - concatenated author strings
   */
  joinAuthors(all = false) {
    if (all) return this.authors.join(", ");
    if (this.authors.length == 1) return this.authors[0];

    var authorNames = "";
    for (let index = 0; index < this.authors.length; index++) {
      if (index == 2) {
        authorNames += "et al.";
        break;
      }
      authorNames += `${this.authors[index]}, `;
    }

    return authorNames;
  }

  get googleScholarAnchor() {
    let rawDisplayName = this.joinAuthors();
    let encodedQuery = encodeURI(
      `${rawDisplayName} "${this.title}". ${this.journal} ${this.volume} ${this.date}`
    );
    let anchorEl = document.createElement("a");
    anchorEl.href = `https://scholar.google.co.uk/scholar?q=${encodedQuery}`;
    anchorEl.text = "Google Scholar";
    anchorEl.target = "_blank";

    return anchorEl;
  }

  // TODO: using string literal is too naive
  get entryHTMLString() {
    let displayName = this.joinAuthors(this.authors);
    return `${displayName} ${this.title} <i>${this.journal}</i> ${this.date} ${this.pages}`;
  }

  get title() {
    return this.citation.title;
  }

  get authors() {
    let authors = [];
    for (let index = 0; index < this.citation.authors.length; index++) {
      const person_name = this.citation.authors[index].person_name;
      let first_name = `${person_name.first_name} ` || "";
      let surname = person_name.surname || "";
      authors.push(`${first_name}${surname}`);
    }
    return authors;
  }

  // NOTE: add to MLA8 citation string
  get publisher() {
    return this.citation.publisher || "";
  }

  get journal() {
    return this.citation.journal || "";
  }

  // NOTE: add to MLA8 citation string
  get series() {
    return this.citation.series || "";
  }

  get pages() {
    let pages = this.citation.scope.pages;
    if (pages === null) return "";

    if (pages.from_page === pages.to_page) return `p. ${pages.to_page}.`;

    return `pp. ${pages.from_page}-${pages.to_page}.`;
  }

  get volume() {
    let volume = this.citation.scope.volume;
    if (volume === null) return "";

    return `vol. ${volume}`;
  }

  get date() {
    let date = this.citation.date;
    let year = date.year;
    let month = date.month || "";
    let day = date.day || "";

    date = [year, month, day].join(" ").trim();
    if (date !== "") {
      date += ".";
    }

    return date;
  }

  get target() {
    return this.citation.target || "";
  }

  get ids() {
    let idUrlArr = [];
    let citationIds = this.citation.ids;
    if (citationIds.doi != null) {
      idUrlArr.push({
        id: citationIds.doi,
        url: `https://doi.org/${citationIds.citation}`,
      });
    }
    if (citationIds.arxiv != null) {
      idUrlArr.push({
        id: citationIds.arxiv,
        url: `https://arxiv.org/abs/${citationIds.arxiv}`,
      });
    }

    return idUrlArr;
  }
}


/***********************************************FOR THE OUTPUT DISPLAY*******************************************************/

var outputBoxes = document.querySelectorAll(".output-boxes");

outputBoxes.forEach((box) => box.addEventListener("click", toggleOpen));

/**
 * Toggles adding the open css class to a div.
 */
function toggleOpen() {
  this.classList.toggle("open");
}

/**
 * Toggle whether the pdf renderer is being displayed or not. If it is not displayed then then changes grid template to
 * one column as opposed to 2 and vice versa.
 */
function togglePDFDisplay() {
  $("pdf-renderer").style.display =
    $("pdf-renderer").style.display == "none" ? "block" : "none";
  $("output-main").style.gridTemplateColumns =
    $("output-main").style.gridTemplateColumns == "1fr" ? "1fr 1fr" : "1fr";
}
