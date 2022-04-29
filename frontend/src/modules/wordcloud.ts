import wordcloud from "wordcloud";

export default class WordCloudCanvas {
  rect: DOMRect;
  constructor(container: HTMLDivElement) {
    this.rect = container.getBoundingClientRect();
  }

  public get width(): number {
    return this.rect.width * 0.8;
  }

  public get height(): number {
    return this.width * 0.65;
  }

  /**
   * Update canvas with wordcloud
   *
   * @param canvas - canvas to draw wordcloud on
   * @param list - represents the words and frequencies
   */
  update(canvas: HTMLCanvasElement, list: Array<[string, number]>) {
    canvas.width = this.width;
    canvas.height = this.height;
    wordcloud(canvas, {
      list: list,
      gridSize: Math.round((16 * canvas.width) / 1024),
      weightFactor: (size) => {
        return size * (1 + canvas.height / canvas.height);
      },
    });
  }
}
