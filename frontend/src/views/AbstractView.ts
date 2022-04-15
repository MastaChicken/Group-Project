export default abstract class {
  params: any;
  constructor(params: any) {
    this.params = params;
    // console.log(params);
  }

  setTitle(title: string) {
    document.title = title;
  }

  async getHtml() {
    return "";
  }

  abstract setupListeners(): void;
}
