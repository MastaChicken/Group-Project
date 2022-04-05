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
 * @param {*} response - response state from fetch call.
 * @returns {*} response
 */
function handleErrors(response) {
  if (!response.ok) throw new Error(response.status);
  return response;
}
/**
 * Checks url is has .pdf suffix, passes it to backend to get a status response.
 * If response is 200 then it is a valid url
 *
 * @returns {*} Boolean  - Returns true if the URL is valid
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
 * @param {*} e - only called to prevent default.
 */
async function uploadPDF(e) {
  e.preventDefault();
  const data = new FormData();
  // Add first file in file input, the PDF, as "file"
  data.append("file", e.target.file.files[0]);
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
      $("references-return-display").textContent = data.citations;
      $("references-return-display").innerHTML = "";

      Object.entries(data.citations).forEach(([k, object]) => {
        Object.entries(object).forEach(([heading, info]) => {
          // Using a MLA 8 citation structure for academic journals
          if (heading == "authors") {
            authors = info;

            console.log(authors);

            display_name = [];
            Object.entries(authors).forEach(([index, author]) => {
              person_name = author.person_name;
              first_name = person_name.first_name;
              surname = person_name.surname;

              if (first_name == null) {
                first_name = " ";
              }
              if (surname == null) {
                surname == " ";
              }
              display_name += first_name + " " + surname + ". ";
            });
          }
          if (heading == "title") {
            title = info;
            console.log(info);
          }
          if (heading == "scope") {
            scope = info;
            display_volume = "vol. " + scope.volume + ", ";
            if (display_volume != null) {
              pages = scope.pages;
              if (pages != null) {
                display_pages =
                  "pp. " + pages.from_page + "-" + pages.to_page + ". ";
              } else {
                display_pages = " ";
              }
            } else {
              display_volume = " ";
            }
          }
          if (heading == "date") {
            date = info;
            year = date.year;
            month = date.month;
            day = date.day;

            if (year != null) {
              date = year + ". ";
              if (month != null) {
                date = month + " " + year + ". ";

                if (day != null) {
                  date = day + " " + month + " " + year + ". ";
                }
              }
            } else {
              date = " ";
            }
          }
          if (heading == "ptr") {
            ptr = info;

            if (ptr == null) {
              ptr = " ";
            }
          }
        });

        $(
          "references-return-display"
        ).innerHTML += `<b>${display_name} "${title}". ${display_volume} ${date} ${display_pages} ${ptr}</b><br><br>`;
      });
      console.log(data.citations);
    });

  openTab("output-display", "tab-contents");
  $("output-main").scrollIntoView();
  $("summary-link").style.display = "inline-block";
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
