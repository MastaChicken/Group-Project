/**
 * Checks if file is valid .pdf
 *
 * @param file - file input. type, name and size are properties of the file.
 * @returns if PDF is valid
 */
export function isValidPDF({ type, name, size }: File): boolean {
  if (size === 0) {
    return false;
  }
  if (type === "application/pdf") {
    return true;
  }
  if (type === "" && name) {
    const fileName = name;
    const lastDotIndex = fileName.lastIndexOf(".");
    return !(
      lastDotIndex === -1 ||
      fileName.substring(lastDotIndex).toLowerCase() !== "pdf"
    );
  }

  return false;
}
