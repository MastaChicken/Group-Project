import { validateURL, uploadPDF } from "./modules/api";
import { dropHandler, dragOverHandler } from "./modules/drag_drop";
import { isValidPDF } from "./modules/pdf";
import { $ } from "./constants";

import Upload from "./views/Upload.js";
import Display from "./views/Display.js";
import Settings from "./views/Settings.js";

const pathToRegex = (path) =>
  new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = (match) => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1]
  );

  return Object.fromEntries(
    keys.map((key, i) => {
      return [key, values[i]];
    })
  );
};

const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

const router = async () => {
  const routes = [
    { path: "/", view: Upload },
    { path: "/display", view: Display },
    { path: "/settings", view: Settings },
  ];

  // Test each route for potential match
  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });

  let match = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null
  );

  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname],
    };
  }

  const view = new match.route.view(getParams(match));

  document.querySelector("#app").innerHTML = await view.getHtml();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });

  router();
});

// // Adds event listener to the upload button, so it executes on change.
// $("pdfpicker-file").addEventListener(
//   "change",
//   () => {
//     let files = $("pdfpicker-file").files;
//     let dropText = $("drop-text");
//     // checks file exists and passes PDF checks.

//     if (files.length > 0 && isValidPDF(files[0])) {
//       dropText.innerHTML = `File accepted: ${files[0].name}`;
//       $("selection-boxes").style.display = "block";
//     } else {
//       // throws alert for wrong file type
//       $("pdfpicker-file").value = "";
//       dropText.innerHTML = "File Rejected: Please add .pdf file type";
//       $("selection-boxes").style.display = "none";
//     }
//   },
//   false
// );

// let sos = $("size-of-summary");
// sos.addEventListener(
//   "change",
//   () => {
//     $("sos-lbl").innerHTML = `Size of Summary: ${sos.value}%`;
//   },
//   true
// );

// // Upload PDF form
// let uploadForm = $("upload-form");
// uploadForm.addEventListener("submit", (ev) => uploadPDF(ev));

// // Upload URL
// let urlInput = $("url-input");
// urlInput.addEventListener("click", validateURL);

// // Drophandler
// let dropZone = $("drop-zone");
// dropZone.addEventListener("drop", (ev) => dropHandler(ev));
// dropZone.addEventListener("dragover", (ev) => dragOverHandler(ev));

// // Toggle PDF
// let pdfToggleInput = $("output-show-document");
// // TODO: use event to check if its toggled or not
// pdfToggleInput.addEventListener("change", togglePDFDisplay);

// // Output display
// let outputBoxes = document.querySelectorAll(".output-boxes");

// outputBoxes.forEach((box) => box.addEventListener("click", toggleOpen));

// /***********************************************FOR THE OUTPUT DISPLAY*******************************************************/

// /**
//  * Toggles adding the open css class to a div.
//  */
// function toggleOpen() {
//   this.classList.toggle("open");
// }

// /**
//  * Toggle whether the pdf renderer is being displayed or not. If it is not displayed then then changes grid template to
//  * one column as opposed to 2 and vice versa.
//  */
// function togglePDFDisplay() {
//   $("pdf-renderer").style.display =
//     $("pdf-renderer").style.display == "none" ? "block" : "none";
//   $("output-main").style.gridTemplateColumns =
//     $("output-main").style.gridTemplateColumns == "1fr" ? "1fr 1fr" : "1fr";
// }
