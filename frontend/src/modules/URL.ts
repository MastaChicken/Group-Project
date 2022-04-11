import { $, API } from "../constants";

/**
 * Checks url is has .pdf suffix, passes it to backend to get a status response.
 * If response is 200 then it is a valid url
 *
 * @returns {boolean} Returns true if the URL is valid
 */
export async function validateURL(): Promise<boolean> {
  var url = ($("pdfpicker-url") as HTMLInputElement).value;

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
 * Handle non-network errors
 *
 * @param {Response} response - response state from fetch call.
 * @returns {Response} response
 * @throws {Error}
 */
function handleErrors(response: Response): any {
  if (!response.ok) throw new Error(response.status.toString());
  return response;
}
