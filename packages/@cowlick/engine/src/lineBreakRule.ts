import {Fragment} from "@akashic-extension/akashic-label";

// https://www.w3.org/TR/2008/WD-jlreq-20081015/ja/#ja-subheading2_1_7
const lineHeadWrap = // 終わり括弧類
(
  "’”）〕］｝〉》」』】⦆〙〗»〟" +
  // ハイフン類
  "‐〜゠–" +
  // 区切り約物
  "？！‼⁇⁈⁉" +
  // 中点類
  "・：；" +
  // 句点類、読点類
  "。．、，" +
  // 繰り返し記号
  "ヽヾゝゞ々〻" +
  // 長音記号
  "ー" +
  // 小書きの仮名
  "ぁぃぅぇぉァィゥェォっゃゅょゎゕゖッャュョヮヵヶㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿㇷ゚" +
  // 割注終わり括弧類
  "）〕］"
).split("");

// https://www.w3.org/TR/2008/WD-jlreq-20081015/ja/#ja-subheading2_1_8
const lineEndWrap = // 始め括弧類
(
  "‘“（〔［｛〈《「『【⦅〘〖«〝" +
  // 割注始め括弧類
  "（〔［"
).split("");

// https://www.w3.org/TR/2008/WD-jlreq-20081015/ja/#ja-subheading2_1_10
const unbreakable = "—…‥".split("");

export const lineBreakRule = (fragments: Fragment[], index: number) => {
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
      } else if (unbreakable.includes(target) && unbreakable.includes(before)) {
        return index + 1;
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
};
