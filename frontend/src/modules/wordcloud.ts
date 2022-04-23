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
  // TODO: customise
  wordcloud(canvas, { list: list });

  return canvas;
}
