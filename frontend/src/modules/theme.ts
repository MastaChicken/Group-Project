import { $ } from "../constants";


export function setupListeners() {
  const lDSwitch = $("light-dark-switch") as HTMLInputElement;
  lDSwitch.addEventListener("sl-change", () => {
    if (lDSwitch.checked === true) {
      document.body.classList.remove("sl-theme-dark");
      document.body.classList.add("sl-theme-light");
      lDSwitch.innerText = "Light";
    } else {
      document.body.classList.remove("sl-theme-light");
      document.body.classList.add("sl-theme-dark");
      lDSwitch.innerText = "Dark";
    }
  });
}
