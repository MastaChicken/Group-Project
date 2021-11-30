const pdfpicker = document.getElementById('pdfpicker');


/* Checks if file is valid .pdf */
function isValidPDF(file) {
    if (file.type === "application/pdf") {
      return true;
    }
    if (file.type === "" && file.name) {
      let fileName = file.name;
      let lastDotIndex = fileName.lastIndexOf(".");
      return !(lastDotIndex === -1 || fileName.substr(lastDotIndex).toUpperCase() !== "PDF");
    }
    return false;
  }
  
  /* Sets the slider for pages to summarise to half max / max. 
  -- This slider should maybe ne a dual slider but these seem to require JQuery or a proper framework. */
  function setPagesToSummarise(file) {
    const ptsSlider = document.getElementById("pages-to-summarise");
    // reads file and function triggers when reader has completed reading.
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onloadend = function(e){
    // let count = number of pages. sets the pages to summarise slider attribute max
    // to the number of pages.
    let count = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length;    
    if(count == 1) {
      ptsSlider.style.display = "none";
      document.getElementById("pts-lbl").style.display = "none";
    }
    else if (count > 1) {
      ptsSlider.style.display = "inline-block";
      document.getElementById("pts-lbl").style.display = "inline-block";
      ptsSlider.setAttribute("max", count);
      ptsSlider.setAttribute("value", count);
      // Then it changes the text for pages to summarise to update with the current value
      // and the max i.e 
      document.getElementById("pts-lbl").innerHTML = ("Pages to Summarise: " + ptsSlider.value + " / " + count);
    }
  }
}

/* Adds event listeners for the pdfpicker upload button and the pages to summarise slider. 
the upload file just sets some text and and the pages slider. */
function listenForFileUpload() {
  let fileToRead = document.getElementById("pdfpicker");
  // Adds event listener to the upload button, so it executes on change. 
  fileToRead.addEventListener("change", e => {
      let files = fileToRead.files;
      let dropText = document.getElementById("drop-text");
      // checks file exists and passes PDF checks.
      if (files.length > 0 && isValidPDF(files[0])) {
        setPagesToSummarise(files[0]);
        dropText.innerHTML = `File accepted: ${files[0].name}`;
        document.getElementsByClassName("selection-boxes")[0].style.display =
          "block";
        console.log($("pdfpicker-file").files);
      } else {
        // throws alert for wrong file type
        document.getElementById("pdfpicker").value = "";
        dropText.innerHTML = "File Rejected: Please add .pdf file type";
        document.getElementsByClassName('selection-boxes')[0].style.display = 'none';
      }
  }, false);

  // adds event listener to the pages to summarise slider, and updates the label text on change
  let ptsValue = document.getElementById("pages-to-summarise");
  ptsValue.addEventListener("change", e => {
    let max = ptsValue.getAttribute('max');
    document.getElementById("pts-lbl").innerHTML = ("Pages to Summarise: " + ptsValue.value + " / " + max);
  }, true);
}

/* Function to monitor when files are dragged over the drag over box. 
Important to remove browsers default functionality i.e chrome wants to copy the pdf file into browser and render. */
function dragOverHandler(ev) {
      console.log('File(s) in drop zone');
      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();
    }

/* Function for handling drop events. Handles the file transfer from event.datatransfer file to being stored in the input="file".
clears dataTransfer data after stored, or determined not valid .pdf filetype.  */
function dropHandler(ev) {
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    console.log(ev.dataTransfer.items)
    
    // If dropped items aren't files, reject them
    if (ev.dataTransfer.items[0].kind === "file") {
      let file = ev.dataTransfer.items[0].getAsFile();
      let dropText = document.getElementById("drop-text");

      if(isValidPDF(file)) {
        // If file is .pdf adjust the page summary slider and set the file input box as the data files then clear event data.
        // This ensures we are only dealing with 1 file at a time and from the same source, so when sending to backend
        // we only have to target the input file. 
        setPagesToSummarise(file)
        dropText.innerHTML = "File accepted: " + file.name;              
        document.getElementById('pdfpicker').files = ev.dataTransfer.files;   
        clearData(ev.dataTransfer);
        document.getElementsByClassName("selection-boxes")[0].style.display =
          "block";

          console.log($("pdfpicker-file").files);
        
      } else {
        // If not a valid .pdf Add reject messsage and clear data from file input and event data.
        dropText.innerHTML = "File Rejected: Please add .pdf file type";
        document.getElementById("pdfpicker").value = "";
        clearData(ev.dataTransfer);
        document.getElementsByClassName('selection-boxes')[0].style.display = 'none';
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

/* Function to change between upload / url tabs. */
function openTab(evt, tabName) {
  /* For Each element of tab-contents(i.e Upload / URL divs) set display = none */
  [...document.getElementsByClassName("tab-contents")].forEach((e) => e.style.display = "none");

  /* Set selected element to be displayed */ 
  document.getElementById(tabName).style.display = "block";
}

/***********************************************FOR THE OUTPUT DISPLAY*******************************************************/


var outputBoxes = document.querySelectorAll(".output-boxes");

console.log(outputBoxes);

outputBoxes.forEach(box => box.addEventListener('click', toggleOpen));

function toggleOpen() {
  this.classList.toggle('open');
}

function togglePDFDisplay() {
  var pdfDocDiv = document.getElementById('pdf-renderer');
  var outputMain = document.getElementById('output-main');

  pdfDocDiv.style.display = pdfDocDiv.style.display == "none" ? "block" : "none";
  outputMain.style.gridTemplateColumns = outputMain.style.gridTemplateColumns == "1fr" ? "1fr 1fr" : "1fr";

}