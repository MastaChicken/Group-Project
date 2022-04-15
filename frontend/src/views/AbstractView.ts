export default abstract class {
  setTitle(title: string) {
    document.title = title;
  }

  async getHtml() {
    return "";
  }

  abstract setupListeners(): void;
}
