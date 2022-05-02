import { SlTag } from "@shoelace-style/shoelace";

/**
 * Create array of SlTags using keywords
 */
export default function makeKeywordTags(keywords: string[]): SlTag[] {
  const tagArr = new Array(keywords.length);
  const variantArray = ["primary", "neutral"];
  const variants = variantArray.length;
  keywords.forEach((keyword, index) => {
    const tag = document.createElement("sl-tag") as SlTag;
    tag.innerText = keyword;
    const variantIndex = index % variants;
    tag.variant = variantArray[variantIndex] as SlTag["variant"];
    tagArr[index] = tag;
  });

  return tagArr;
}
