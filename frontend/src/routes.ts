import Navaid from "navaid";
import Upload from "./views/Upload";
import Display from "./views/Display";

const router = Navaid();

router
  .on("/", async () => {
    const upload = new Upload();
    document.getElementById("app").innerHTML = await upload.getHtml();
    upload.setupListeners();
  })
  .on("/display", async () => {
    const display = new Display();
    document.getElementById("app").innerHTML = await display.getHtml();
    display.setupListeners();
  });

router.listen();
