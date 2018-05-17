import {Fragment} from "@akashic-extension/akashic-label";

// https://www.w3.org/TR/2008/WD-jlreq-20081015/ja/#ja-subheading2_1_7
const lineHeadWrap =
  "’”）〕］｝〉》」』】⦆〙〗»〟" +
  "‐〜゠–" +
  "？！‼⁇⁈⁉" +
  "・：；" +
  "。．、，" +
  "ヽヾゝゞ々〻" +
  "ー" +
  "ぁぃぅぇぉァィゥェォっゃゅょゎゕゖッャュョヮヵヶㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿㇷ゚" +
  "）〕］"
  .split("");

const lineEndWrap =
  "‘“（〔［｛〈《「『【⦅〘〖«〝" +
  "（〔［"
  .split("");

export function lineBreakRule(fragments: Fragment[], index: number) {
  const target = fragments[index];
  if (typeof target !== "string") {
    return index;
  } else if (lineHeadWrap.includes(target)) {
    return index + 1;
  } else {
    const before = fragments[index - 1];
    if (before) {
      if (typeof before !== "string") {
        return index;
      } else if (lineHeadWrap.includes(before)) {
        return index;
      } else if (lineEndWrap.includes(before)) {
        return index - 1;
      } else {
        return index;
      }
      } else {
        return index;
      }
  }
}
