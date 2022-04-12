import { $ } from "../constants";
import { isValidPDF } from "./pdf";

/**
 * Function to monitor when files are dragged over the drag over box.
 * Important to remove browsers default functionality, i.e chrome wants to copy the pdf file into browser and render.
 *
 * @param ev - dragOverHandler event.
 */
export function dragOverHandler(ev: DragEvent): void {
  console.log("File(s) in drop zone");
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

/**
 * Function for handling drop events. Handles the file transfer from event.datatransfer file to being stored in the input="file".
 * clears dataTransfer data after stored, or determined not valid .pdf filetype.
 *
 * @param ev - dropHandler event.
 */
export function dropHandler(ev: DragEvent): void {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // If dropped items aren't files, reject them
    if (ev.dataTransfer.items[0].kind === "file") {
      const file = ev.dataTransfer.items[0].getAsFile();
      const dropText = $("drop-text");

      if (isValidPDF(file)) {
        // If file is .pdf adjust the page summary slider and set the file input box as the data files then clear event data.
        // This ensures we are only dealing with 1 file at a time and from the same source, so when sending to backend
        // we only have to target the input file.
        dropText.innerHTML = `File accepted: ${file.name}`;
        ($("pdfpicker-file") as HTMLInputElement).files = ev.dataTransfer.files;
        clearData(ev.dataTransfer);
        $("selection-boxes").style.display = "block";
      } else {
        // If not a valid .pdf Add reject messsage and clear data from file input and event data.
        dropText.innerHTML = "File Rejected: Please add .pdf file type";
        ($("pdfpicker-file") as HTMLInputElement).value = "";
        clearData(ev.dataTransfer);
        $("selection-boxes").style.display = "none";
      }
    }
  }
}

/**
 * Handles clearing data with check for items.
 *
 * @param data - dataTransfer data.
 */
function clearData(data: DataTransfer): void {
  if (data.items) {
    // Use DataTransferItemList interface to remove the drag data
    data.items.clear();
  } else {
    // Use DataTransfer interface to remove the drag data
    data.clearData();
  }
}
