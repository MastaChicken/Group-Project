import wordcloud from "wordcloud";

/**
 * Represents the wordcloud using a canvas
 *
 */
export default class WordCloudCanvas {
  rect: DOMRect;
  constructor(container: HTMLDivElement) {
    this.rect = container.getBoundingClientRect();
  }

  /** Returns width relative to container */
  public get width(): number {
    return this.rect.width * 0.8;
  }

  /** Returns height relative to width */
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
      weightFactor: (size) => {
        return size * (1 + canvas.height / canvas.height);
      },
    });
  }
}
