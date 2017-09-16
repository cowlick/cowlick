"use strict";
import * as novel from "../../lib/index";

export const scene2 = new novel.Scene({
  label: "2",
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
          value: "シーン2です"
        }
      }
    ])
  ]
});