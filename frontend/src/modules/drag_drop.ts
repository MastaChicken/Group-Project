import { $ } from "../constants";

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
  const pdfpickerInput = $("pdfpicker-file") as HTMLInputElement;
  pdfpickerInput.files = ev.dataTransfer.files;
  const event = new Event('change');
  pdfpickerInput.dispatchEvent(event);
  clearData(ev.dataTransfer);
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
