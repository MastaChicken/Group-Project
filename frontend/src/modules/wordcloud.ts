import wordcloud from "wordcloud";
import { style, $ } from "../constants";

/**
 * Represents the wordcloud using a canvas
 *
 */
export default class WordCloudCanvas {
  private container: HTMLDivElement;
  rect: DOMRect;
  constructor(container: HTMLDivElement) {
    this.container = container;
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

  /** Returns value of sl-color-neutral-0 */
  public get backgroundColor(): string {
    return style.getPropertyValue("--sl-color-neutral-0");
  }

  /**
   * Setup canvas with wordcloud
   * Appropriate event listeners can be added too.
   *
   * @param canvas - canvas to draw wordcloud on
   * @param list - represents the words and frequencies
   */
  setup(canvas: HTMLCanvasElement, list: Array<[string, number]>) {
    canvas.width = this.width;
    canvas.height = this.height;
    function update(color: string) {
      wordcloud(canvas, {
        list: list,
        color: "random-light",
        backgroundColor: color,
        weightFactor: (size) => {
          return size * (3 + canvas.height / canvas.height);
        },
      });
    }

    update(this.backgroundColor);
    $("light-dark-switch").addEventListener("click", () =>
      update(this.backgroundColor)
    );
  }
}
