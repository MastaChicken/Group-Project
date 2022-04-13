import * as PDFJS from "pdfjs-dist";
import { $ } from "../constants";
PDFJS.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.13.216/build/pdf.worker.js";

var myState = {
  pdf: null,
  currentPage: 1,
  zoom: 1,
};

let loadingTask = PDFJS.getDocument("./src/test.pdf");
loadingTask.promise.then(function (pdf) {
  myState.pdf = pdf;
  console.log(pdf);
  render();
});

/**
 *
 */
function render() {
  myState.pdf.getPage(myState.currentPage).then((page) => {
    var scale = 1.5;
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
  });
}
