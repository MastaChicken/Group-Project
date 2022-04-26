import wordcloud from "wordcloud";

/**
 * Create wordcloud canvas
 *
 * @param list - represents the words and frequencies
 */
export default function makeWordCloudCanvas(
  list: Array<[string, number]>
): HTMLCanvasElement {
  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  // TODO: customise
  wordcloud(canvas, { list: list });

  return canvas;
}
