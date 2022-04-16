import { $ } from "../constants";
import * as PDFJS from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// cdn.jsdelivr.net/npm/pdfjs-dist@2.13.216/build/pdf.worker.js
// keeping cdn link in case any issues arise from loading in worker
// from node module.

export let myState = {
  pdf: null,
  currentPage: 1,
  totalPages: 1,
  zoom: 1,
};

export let pageRendering = false,
  pageNum = 1,
  pageNumPending = null;

/**
 * Loads pdf into a loading task and then renders the page from a promise.
 * Loads pdf and details into state object.
 *
 * @param {*} pdf - pdf file passed as Uint8Array
 */
export function renderPDF(pdf) {
  let loadingTask = PDFJS.getDocument(pdf);
  loadingTask.promise.then(function (pdf) {
    myState.pdf = pdf;
    myState.zoom = 1;
    myState.currentPage = 1;
    myState.totalPages = pdf.numPages;
    render();
  });
}

/**
 *
 */
export function render() {
  pageRendering = true;
  myState.pdf.getPage(myState.currentPage).then((page) => {
    let containerWidth = $("canvas_container").clientWidth;
    var scale =
      (containerWidth / page.getViewport({ scale: 1.0 }).width) * myState.zoom;

    var viewport = page.getViewport({ scale: scale });
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
export function queueRenderPage() {
  if (pageRendering) {
    pageNumPending = myState.currentPage;
  } else {
    render();
  }
}

/**
 * Displays previous page.
 */
export function onPrevPage() {
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
export function onNextPage() {
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
export function zoomIntoPage() {
  myState.zoom += 0.1;
  render();
}
$("zoom_in").addEventListener("click", zoomIntoPage);

/**
 * Zoom Out of page by 0.1 scale.
 */
export function zoomOutPage() {
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
