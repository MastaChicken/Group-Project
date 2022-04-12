import { validateURL, uploadPDF } from "./modules/api";
import { dropHandler, dragOverHandler } from "./modules/drag_drop";
import { isValidPDF } from "./modules/pdf";
import { $ } from "./constants";

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
