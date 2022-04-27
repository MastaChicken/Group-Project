export default abstract class {
  setTitle(title: string) {
    document.title = title;
  }

  abstract getHtml(): string;

  abstract setupListeners(): void;
}
