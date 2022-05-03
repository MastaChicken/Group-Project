import { $ } from "../constants";

export default abstract class {
  headingCenter = $("header-center") as HTMLDivElement;
  headingLeft = $("header-left") as HTMLDivElement;

  setTitle(title: string) {
    document.title = title;
    const headingEl = document.createElement("h1");
    headingEl.innerText = "SummarEase";
    const subHeadingEl = document.createElement("h4");
    subHeadingEl.innerText =
      "The easiest scholarly article summariser on the internet!";
    this.headingCenter.replaceChildren(...[headingEl, subHeadingEl]);

    this.headingLeft.replaceChildren();
  }

  abstract getHtml(): string;

  abstract setupListeners(): void;
}
