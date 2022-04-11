import MLA8Citation from "./modules/MLA8Citation.js";

const $ = (id) => document.getElementById(id);
const API = "http://localhost:8000";

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
 * Adds event listeners for the pdfpicker file input, the pages to summarise slider, size of summary slider.
 *
 * The Event Listener for pdfpicker waits for change in the pdfpicker-file. Once detected this then checks
 * the files in input files for being over zero and calls isValidPDF(). If true, then calls
 * setPagesToSymmarise() and changes text in Drag and Drop box.
 *
 * Event for pages-to-summarise slider detects user changing value and updates label accordingly.
 *
 * Event for size-of-summary slider detects user changing value and updates label accordingly.
 *
 * Event for upload-form calls uploadPDF function on submit.
 */
window.onload = () => {
  // Adds event listener to the upload button, so it executes on change.
  $("pdfpicker-file").addEventListener(
    "change",
    () => {
      let files = $("pdfpicker-file").files;
      let dropText = $("drop-text");
      // checks file exists and passes PDF checks.
      if (files.length > 0 && isValidPDF(files[0])) {
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

  let sos = $("size-of-summary");
  sos.addEventListener(
    "change",
    () => {
      $("sos-lbl").innerHTML = `Size of Summary: ${sos.value}%`;
    },
    true
  );

  // Upload PDF form
  let uploadForm = $("upload-form");
  uploadForm.addEventListener("submit", (ev) => uploadPDF(ev));

  // Upload URL
  let urlInput = $("url-input");
  urlInput.addEventListener("click", validateURL);

  // Drophandler
  let dropZone = $("drop-zone");
  dropZone.addEventListener("drop", (ev) => dropHandler(ev));
  dropZone.addEventListener("dragover", (ev) => dragOverHandler(ev));

  // Toggle PDF
  let pdfToggleInput = $("output-show-document");
  // TODO: use event to check if its toggled or not
  pdfToggleInput.addEventListener("change", togglePDFDisplay);

  // Output display
  let outputBoxes = document.querySelectorAll(".output-boxes");

  outputBoxes.forEach((box) => box.addEventListener("click", toggleOpen));
};

/**
 * Function to monitor when files are dragged over the drag over box.
 * Important to remove browsers default functionality, i.e chrome wants to copy the pdf file into browser and render.
 *
 * @param {DragEvent} ev - dragOverHandler event.
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
 * @param {DragEvent} ev - dropHandler event.
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
// TODO: Replace tab functionality
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
        pEl.innerHTML = citationObj.entryHTMLString();
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
        listEl.appendChild(citationObj.googleScholarAnchor());

        oLinkEl.append(listEl);
      });
      $("references-return-display").append(oLinkEl);
    });

  openTab("output-display", "tab-contents");
  $("output-main").scrollIntoView();
  // $("summary-link").style.display = "inline-block";
}

/***********************************************FOR THE OUTPUT DISPLAY*******************************************************/

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
