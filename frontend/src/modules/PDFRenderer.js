import { $ } from "../constants";
import * as PDFJS from "pdfjs-dist";

PDFJS.GlobalWorkerOptions.workerSrc =
  "../../node_modules/pdfjs-dist/build/pdf.worker.min.js";

// cdn.jsdelivr.net/npm/pdfjs-dist@2.13.216/build/pdf.worker.js
// keeping cdn link in case any issues arise from loading in worker
// from node module.

let myState = {
  pdf: null,
  currentPage: 1,
  totalPages: 1,
  zoom: 1,
};

let pageRendering = false,
  pageNumPending = null;

let zoomArray = [1.0, 1.1, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0, 5.0];
let counter = 0;

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
    counter = 0;

    preCalculateSize();
    var pdfRender = $("canvas_container");
    for (var i = 0; i < myState.totalPages; i++) {
      var canvas = render();
      pdfRender.append(canvas);
      onNextPage();
    }
  });
}

/**
 * Set up listeners required for PDF viewer interaction.
 */
export function setupListeners() {
  $("go_previous").addEventListener("click", onPrevPage);
  $("go_next").addEventListener("click", onNextPage);
  $("current_page").addEventListener("change", onPageEntry);
  $("zoom_in").addEventListener("click", zoomIntoPage);
  $("zoom_out").addEventListener("click", zoomOutPage);
}

var canvas_info;

function preCalculateSize() {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  console.log(myState.currentPage);
  myState.pdf.getPage(myState.currentPage).then((page) => {
    let containerWidth = $("canvas_container").clientWidth;
    var scale =
      (containerWidth / page.getViewport({ scale: 1.0 }).width) * myState.zoom;

    //This is hacky code to remove horizontal scrollbar
    //as the width gets generated without vertical scroll
    // and then adds it after, which then generates a
    // horizontal scroll, and i didn't know how to fix.
    // the class just removes the scroll bar.
    if (myState.zoom === 1) {
      $("canvas_container").classList.add("fullPage");
    } else {
      $("canvas_container").classList.remove("fullPage");
    }

    var viewport = page.getViewport({ scale: scale });
    // Support HiDPI-screens.
    var outputScale = window.devicePixelRatio || 1;

    var width = Math.floor(viewport.width * outputScale);
    var height = Math.floor(viewport.height * outputScale);
    var style_width = Math.floor(viewport.width) + "px";
    var style_height = Math.floor(viewport.height) + "px";

    canvas_info = [
      width,
      height,
      style_width,
      style_height,
      viewport,
      outputScale,
    ];

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
  $("current_page").value = myState.currentPage;
  return canvas;
}
/**
 * Render pdf.
 */
function render() {
  pageRendering = true;

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  console.log(myState.currentPage);
  myState.pdf.getPage(myState.currentPage).then((page) => {
    if (myState.zoom === 1) {
      $("canvas_container").classList.add("fullPage");
    } else {
      $("canvas_container").classList.remove("fullPage");
    }
    //                        0     1       2             3             4         5
    // var canvas_info = [width, height, style_width, style_height, viewport, outputScale];

    canvas.width = canvas_info[0];
    canvas.height = canvas_info[1];
    canvas.style.width = canvas_info[2];
    canvas.style.height = canvas_info[3];

    var transform =
      canvas_info[5] !== 1
        ? [canvas_info[5], 0, 0, canvas_info[5], 0, 0]
        : null;

    var renderContext = {
      canvasContext: context,
      transform: transform,
      viewport: canvas_info[4],
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
  $("current_page").value = myState.currentPage;
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

/**
 * Displays next page.
 */
function onNextPage() {
  if (myState.currentPage >= myState.totalPages) {
    return;
  }
  myState.currentPage++;
  document.body.style.cursor = "wait";
  queueRenderPage(myState.currentPage);
}

/**
 * Change page if user manually enters a page into the input box.
 */
function onPageEntry() {
  let pageInput = $("current_page");
  if (
    Number(pageInput.value) > myState.totalPages ||
    Number(pageInput.value) < 1
  ) {
    return;
  }
  myState.currentPage = Number(pageInput.value);
  queueRenderPage(myState.currentPage);
}

/**
 * Zoom into page by 0.1 scale.
 */
function zoomIntoPage() {
  if (Reflect.get($("zoom_in"), "disabled") === true) {
    return;
  }

  myState.zoom = zoomArray[++counter];
  $("zoom_out").removeAttribute("disabled");
  $("zoom_label").innerText = Math.floor(myState.zoom * 100) + "%";
  queueRenderPage(myState.currentPage);
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
  queueRenderPage(myState.currentPage);
  $("zoom_label").innerText = Math.floor(myState.zoom * 100) + "%";
  if (myState.zoom <= 1) {
    Reflect.set($("zoom_out"), "disabled", true);
    return;
  }
}

window.addEventListener("resize", function () {
  render();
});

/**
 * Asynchronously downloads PDF.
 */
// pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
//   pdfDoc = pdfDoc_;
//   document.getElementById("page_count").textContent = pdfDoc.numPages;

//   // Initial/first page rendering
//   renderPage(pageNum);
// });
