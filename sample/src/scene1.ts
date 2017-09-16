"use strict";
import * as novel from "../../lib/index";

export const scene1 = new novel.Scene({
  label: "1",
  frames: [
    new novel.Frame([
      {
        tag: novel.Tag.image,
        data: {
          assetId: "black",
          layer: novel.Layer.background
        }
      },
      {
        tag: novel.Tag.text,
        data: {
          value: "シーン1です"
        }
      }
    ])
  ]
});