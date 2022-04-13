import MLA8Citation from "./modules/MLA8Citation";
import { validateURL } from "./modules/URL";
import { dropHandler, dragOverHandler } from "./modules/DragDropHandlers";
import { isValidPDF } from "./modules/PDF";
import { $, API } from "./constants";
import * as PDFJS from "pdfjs-dist";
PDFJS.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.13.216/build/pdf.worker.js";

// TODO: move event listeners to modules
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
  // openTab("upload-form", "tab-contents");
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
        let fileReader = new FileReader();
        fileReader.onload = function () {
          let pdfArray = new Uint8Array(this.result);
          renderPDF(pdfArray);
        };
        fileReader.readAsArrayBuffer(files[0]);
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

        // TODO: use a grid of icons instead of paragraphs
        // Show ids
        if (citationObj.ids?.length) {
          pEl = document.createElement("p");
          citationObj.ids.forEach((idUrl) => {
            let anchorEl = document.createElement("a");
            anchorEl.href = idUrl.url;
            anchorEl.text = idUrl.id;
            anchorEl.target = "_blank";
            pEl.append(anchorEl);
          });
          listEl.appendChild(pEl);
        }

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
    $("output-main").style.gridTemplateColumns == "1fr 1fr"
      ? "1fr 1fr 1fr"
      : "1fr 1fr";
}

let myState = {
  pdf: null,
  currentPage: 1,
  totalPages: 1,
  zoom: 1,
};

let pageRendering = false,
  pageNum = 1,
  pageNumPending = null;

/**
 * Loads pdf into a loading task and then renders the page from a promise.
 * Loads pdf and details into state object.
 * @param {*} pdf - pdf file passed as Uint8Array
 */
function renderPDF(pdf) {
  let loadingTask = PDFJS.getDocument(pdf);
  loadingTask.promise.then(function (pdf) {
    myState.pdf = pdf;
    myState.totalPages = pdf.numPages;
    console.log(pdf);
    render();
  });
}

/**
 *
 */
function render() {
  pageRendering = true;
  myState.pdf.getPage(myState.currentPage).then((page) => {
    var scale = myState.zoom;
    var viewport = page.getViewport({scale: scale});
    // Support HiDPI-screens.
    var outputScale = window.devicePixelRatio || 1;

    var canvas = $("pdf_renderer");
    var context = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    var transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    var renderContext = {
      canvasContext: context,
      transform: transform,
      viewport: viewport,
    };
    page.render(renderContext);
    pageRendering = false;

    // renderTask.promise.then(function () {
    //   pageRendering = false;
    //   if (pageNumPending !== null) {
    //     // New page rendering is pending
    //     render();
    //     pageNumPending = null;
    //   }
    // });
  });
  $("current_page").value = myState.currentPage;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage() {
  if (pageRendering) {
    pageNumPending = myState.currentPage;
  } else {
    render();
  }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (myState.currentPage <= 1) {
    return;
  }
  myState.currentPage--;
  queueRenderPage(myState.currentPage);
}
$("go_previous").addEventListener("click", onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
  if (myState.currentPage >= myState.totalPages) {
    return;
  }
  myState.currentPage++;
  queueRenderPage(myState.currentPage);
}
$("go_next").addEventListener("click", onNextPage);

/**
 * Zoom into page by 0.1 scale.
 */
function zoomIntoPage() {
  myState.zoom += 0.1;
  render();
}
$("zoom_in").addEventListener("click", zoomIntoPage);

/**
 * Zoom Out of page by 0.1 scale.
 */
function zoomOutPage() {
  myState.zoom -= 0.1;
  render();
}
$("zoom_out").addEventListener("click", zoomOutPage);

/**
 * Asynchronously downloads PDF.
 */
// pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
//   pdfDoc = pdfDoc_;
//   document.getElementById("page_count").textContent = pdfDoc.numPages;

//   // Initial/first page rendering
//   renderPage(pageNum);
// });
