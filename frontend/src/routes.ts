import Navaid from "navaid";
import Upload from "./views/Upload";
import Display from "./views/Display";

import { $ } from "./constants";
import NotFound from "./views/NotFound";

const router = Navaid();
const outlet = $("outlet");

router
  .on("/", () => {
    const upload = new Upload();
    outlet.innerHTML = upload.getHtml();
    upload.setupListeners();
  })
  .on("/display", () => {
    const display = new Display();
    outlet.innerHTML = display.getHtml();
    display.setupListeners();
  })
  .on("*", () => {
    const notFound = new NotFound();
    outlet.innerHTML = notFound.getHtml();
    notFound.setupListeners();
  })

router.listen();
