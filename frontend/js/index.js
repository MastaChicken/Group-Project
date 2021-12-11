const $ = (id) => document.getElementById(id);

/* Checks if file is valid .pdf */
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

/* Sets the slider for pages to summarise to half max / max.
  -- This slider should maybe ne a dual slider but these seem to require JQuery or a proper framework. */
function setPagesToSummarise(file) {
  const ptsSlider = $("pages-to-summarise");
  // reads file and function triggers when reader has completed reading.
  let reader = new FileReader();
  reader.readAsBinaryString(file);
  reader.onloadend = (e) => {
    // let count = number of pages. sets the pages to summarise slider attribute max
    // to the number of pages.
    let count = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length;
    if (count == 1) {
      ptsSlider.style.display = "none";
      $("pts-lbl").style.display = "none";
    } else if (count > 1) {
      ptsSlider.style.display = "inline-block";
      $("pts-lbl").style.display = "inline-block";
      ptsSlider.setAttribute("max", count);
      ptsSlider.setAttribute("value", count);
      // Then it changes the text for pages to summarise to update with the current value
      // and the max i.e
      $(
        "pts-lbl"
      ).innerHTML = `Pages to Summarise: ${ptsSlider.value} / ${count}`;
    }
  };
}

/* Adds event listeners for the pdfpicker upload button and the pages to summarise slider.
the upload file just sets some text and and the pages slider. */
function listenForFileUpload() {
  // Adds event listener to the upload button, so it executes on change.
  $("pdfpicker-file").addEventListener(
    "change",
    (e) => {
      let files = $("pdfpicker-file").files;
      let dropText = $("drop-text");
      // checks file exists and passes PDF checks.
      if (files.length > 0 && isValidPDF(files[0])) {
        setPagesToSummarise(files[0]);
        dropText.innerHTML = `File accepted: ${files[0].name}`;
        document.getElementsByClassName("selection-boxes")[0].style.display =
          "block";
      } else {
        // throws alert for wrong file type
        $("pdfpicker-file").value = "";
        dropText.innerHTML = "File Rejected: Please add .pdf file type";
        document.getElementsByClassName("selection-boxes")[0].style.display =
          "none";
      }
    },
    false
  );

  // adds event listener to the pages to summarise slider, and updates the label text on change
  let ptsValue = $("pages-to-summarise");
  ptsValue.addEventListener(
    "change",
    (e) => {
      let max = ptsValue.getAttribute("max");
      $("pts-lbl").innerHTML = `Pages to Summarise: ${ptsValue.value} / ${max}`;
    },
    true
  );

  let sos = $("size-of-summary");
  sos.addEventListener(
    "change",
    (e) => {     
      $("sos-lbl").innerHTML = `Size of Summary: ${sos.value}%`;
    },
    true
  );

}

  

/* Function to monitor when files are dragged over the drag over box.
Important to remove browsers default functionality i.e chrome wants to copy the pdf file into browser and render. */
function dragOverHandler(ev) {
  console.log("File(s) in drop zone");
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

/* Function for handling drop events. Handles the file transfer from event.datatransfer file to being stored in the input="file".
clears dataTransfer data after stored, or determined not valid .pdf filetype.  */
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
        document.getElementsByClassName("selection-boxes")[0].style.display =
          "block";
      } else {
        // If not a valid .pdf Add reject messsage and clear data from file input and event data.
        dropText.innerHTML = "File Rejected: Please add .pdf file type";
        $("pdfpicker-file").value = "";
        clearData(ev.dataTransfer);
        document.getElementsByClassName("selection-boxes")[0].style.display =
          "none";
      }
    }
  }
}

/* Handles clearing data with check for items. */
function clearData(data) {
  if (data.items) {
    // Use DataTransferItemList interface to remove the drag data
    data.items.clear();
  } else {
    // Use DataTransfer interface to remove the drag data
    data.clearData();
  }
}

/* Changes between upload / url tabs */
function openTab(tabName, className) {
  /*
  Couldn't get this ES6 version of the code to work properly, so i think something is wrong with it.
  Kept so we can maybe refer to it when updating coding conventions to ES6 later. 
  */
  // [...document.getElementsByClassName("tab-contents")].forEach(
    //   ({ style }) => (style.display = "none"));
    

    /* For Each element of tab-contents(i.e Upload / URL divs) set display = none */
  tabs = document.getElementsByClassName(className);
  for(i = 0; i < tabs.length; i++) { tabs[i].style.display = "none"; }

  /* Set selected element to be displayed */
  show = document.getElementsByClassName(tabName);
  for(i = 0; i < show.length; i++) { show[i].style.display = "block"; }
}

function validateStatus(statusCode) {
  if(statusCode == 200) { return true; }
  else { return false; }
}

function validateString(url) {
  if (url.indexOf("http://") == 0 || url.indexOf("https://")) {
    url = "http://" + url;
  }
  if (url.indexOf(".pdf") == -1) { url = "false"; }
  return url;
}

async function validateURL() {
  const url = "http://localhost:8000";
  urlString = $('pdfpicker-url').value;
  
  urlString = validateString(urlString);
  
  if(urlString == "false") {
    console.log(urlString);
  } else {

    await fetch(`${url}/validate_url/?url=${urlString}`)
      .then((data) => {
        if(validateStatus(data.status)) { console.log('ok!'); }
      })
    }
    
}

/* Handle non-network errors */
function handleErrors(response) {
  if (!response.ok) throw new Error(response.status);
  return response;
}


/* Sends request to API with the pdf uploaded to form */
async function uploadPDF(e) {
  e.preventDefault();
  const url = "http://localhost:8000";
  const data = new FormData();
  // Add first file in file input, the PDF, as "file"
  data.append("file", e.target.file.files[0]);
  await fetch(`${url}/upload`, { method: "POST", body: data })
    .then(handleErrors)
    .then((r) => r.json())
    .then((data) => {
      $("metadata-return-display").innerHTML = "";
      Object.entries(data.metadata).forEach(([k, v]) => {
        $("metadata-return-display").innerHTML += `<b>${k}:</b> ${v}<br><br>`;
      });
      $("summary-return-display").textContent = data.text;
      $("references-return-display").textContent = data.toc;
    })
    ;
    (openTab('output-display', 'tab-contents'));
    $('output-main').scrollIntoView();
    $('summary-link').style.display = "inline-block";
}

/***********************************************FOR THE OUTPUT DISPLAY*******************************************************/


var outputBoxes = document.querySelectorAll(".output-boxes");

outputBoxes.forEach(box => box.addEventListener('click', toggleOpen));

function toggleOpen() {
  this.classList.toggle('open');
}

function togglePDFDisplay() {
  $('pdf-renderer').style.display = $('pdf-renderer').style.display == "none" ? "block" : "none";
  $('output-main').style.gridTemplateColumns = $('output-main').style.gridTemplateColumns == "1fr" ? "1fr 1fr" : "1fr";
}