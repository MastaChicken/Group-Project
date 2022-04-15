import * as WordCloud from "wordcloud";

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
  WordCloud(canvas, { list: list });

  return canvas;
}
