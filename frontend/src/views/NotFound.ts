import { html } from "../constants";
import AbstractView from "./AbstractView";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("404");
  }

  getHtml(): string {
    return html`<h1>404</h1>`;
  }

  setupListeners(): void {
    return void 0;
  }
}
