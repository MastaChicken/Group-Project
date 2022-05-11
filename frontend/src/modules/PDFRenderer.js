import { $ } from "../constants";
import * as _pdfjs from "pdfjs-dist";

const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${_pdfjs.version}/pdf.worker.js`;
_pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

// cdn.jsdelivr.net/npm/pdfjs-dist@2.13.216/build/pdf.worker.js
// keeping cdn link in case any issues arise from loading in worker
// from node module.

let myState = {
  pdf: null,
  currentPage: 1,
  totalPages: 1,
  zoom: 1,
  pageHeight: 0,
};

let init = true;

let pageRendering = false,
  pageNumPending = null;

let canvasArray;

let zoomArray = [1.0, 1.1, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0, 5.0];
let counter = 0;

/**
 * Loads pdf into a loading task and then renders the page from a promise.
 * Loads pdf and details into state object.
 *
 * @param {*} pdf - pdf file passed as Uint8Array
 */
export function renderPDF(pdf) {
  init = true;
  let loadingTask = _pdfjs.getDocument(pdf);
  loadingTask.promise.then(function (pdf) {
    myState.pdf = pdf;
    myState.zoom = 1;
    myState.currentPage = 1;
    myState.totalPages = pdf.numPages;
    counter = 0;
    canvasArray = new Array(pdf.numPages);

    // preCalculateSize();
    var pdfRender = $("canvas_container");
    for (var i = 0; i < myState.totalPages; i++) {
      var canvas = render();
      canvasArray[i] = canvas;
      pdfRender.append(canvas);
      myState.currentPage++;
    }

    Reflect.set($("current_page"), "min", 1);
    Reflect.set($("current_page"), "max", myState.totalPages);
    $("current_page").value = myState.currentPage = 1;
    init = false;
  });
}

/**
 * Set up listeners required for PDF viewer interaction.
 */
export function setupListeners() {
  $("canvas_container").addEventListener("scroll", onScroll);
  $("go_previous").addEventListener("click", onPrevPage);
  $("go_next").addEventListener("click", onNextPage);
  $("current_page").addEventListener("sl-change", onPageEntry);
  $("zoom_in").addEventListener("click", zoomIntoPage);
  $("zoom_out").addEventListener("click", zoomOutPage);
}

/**
 * Render pdf.
 */
function render() {
  pageRendering = true;
  var canvas;

  if (init == true) {
    canvas = document.createElement("canvas");
  } else {
    canvas = canvasArray[myState.currentPage - 1];
  }

  myState.pdf.getPage(myState.currentPage).then((page) => {
    let containerWidth = $("canvas_container").clientWidth;
    var scale =
      (containerWidth / page.getViewport({ scale: 1.0 }).width) * myState.zoom;

    var viewport = page.getViewport({ scale: scale });
    // Support HiDPI-screens.
    var outputScale = window.devicePixelRatio || 1;

    // var canvas = $("pdf_renderer");
    var context = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    myState.pageHeight = Math.floor(viewport.height);

    var transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    var renderContext = {
      canvasContext: context,
      transform: transform,
      viewport: viewport,
    };
    let renderTask = page.render(renderContext);

    renderTask.promise.then(function () {
      pageRendering = false;
      document.body.style.cursor = "default";
      if (pageNumPending !== null) {
        // New page rendering is pending
        render();
        pageNumPending = null;
      }
    });
  });
  // $("current_page").value = myState.currentPage;
  return canvas;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage() {
  if (pageRendering) {
    pageNumPending = myState.currentPage;
  } else {
    renderAll();
  }
}

function renderAll() {
  let temp = myState.currentPage;
  myState.currentPage = 0;
  for (var i = 0; i < myState.totalPages; i++) {
    myState.currentPage++;
    render();
  }
  myState.currentPage = temp;
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (myState.currentPage <= 1) {
    return;
  }
  --myState.currentPage;
  let target = canvasArray[myState.currentPage - 1];
  target.parentNode.scrollTop = target.offsetTop;
}

/**
 * Displays next page.
 */
function onNextPage() {
  if (myState.currentPage >= myState.totalPages) {
    return;
  }
  ++myState.currentPage;
  let target = canvasArray[myState.currentPage - 1];
  target.parentNode.scrollTop = target.offsetTop;
}

/**
 * Change page if user manually enters a page into the input box.
 */
function onPageEntry() {
  let pageInput = $("current_page");
  if (pageInput.value > myState.totalPages || pageInput.value < 1) {
    pageInput.value = myState.currentPage;
    return;
  }
  myState.currentPage = pageInput.value;
  let target = canvasArray[myState.currentPage - 1];
  target.parentNode.scrollTop = target.offsetTop;
}

/**
 * Zoom into page by 0.1 scale.
 */
function zoomIntoPage() {
  if (Reflect.get($("zoom_in"), "disabled") === true) {
    return;
  }
  $("zoom_out").removeAttribute("disabled");
  myState.zoom = zoomArray[++counter];
  queueRenderPage();
  $("zoom_label").innerText = Math.floor(myState.zoom * 100) + "%";

  if (myState.zoom >= 5) {
    Reflect.set($("zoom_in"), "disabled", true);
    return;
  }
}

/**
 * Zoom Out of page by 0.1 scale.
 */
function zoomOutPage() {
  if (Reflect.get($("zoom_out"), "disabled") === true) {
    return;
  }
  myState.zoom = zoomArray[--counter];
  $("zoom_in").removeAttribute("disabled");
  queueRenderPage();
  $("zoom_label").innerText = Math.floor(myState.zoom * 100) + "%";
  if (myState.zoom <= 1) {
    Reflect.set($("zoom_out"), "disabled", true);
    return;
  }
}

function onScroll() {
  myState.currentPage =
    Math.round($("canvas_container").scrollTop / myState.pageHeight) + 1;

  $("current_page").value = myState.currentPage;
}

/**
 * Asynchronously downloads PDF.
 */
// pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
//   pdfDoc = pdfDoc_;
//   document.getElementById("page_count").textContent = pdfDoc.numPages;

//   // Initial/first page rendering
//   renderPage(pageNum);
// });
