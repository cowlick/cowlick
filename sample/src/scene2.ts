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
          layer: {
            name: novel.Layer.background
          }
        }
      },
      {
        tag: novel.Tag.text,
        data: {
          values: [
            "シーン2です"
          ]
        }
      }
    ]),
    new novel.Frame([
      {
        tag: novel.Tag.text,
        data: {
          values: [
            "タイトル画面に戻ります"
          ]
        }
      }
    ]),
    new novel.Frame([
      {
        tag: novel.Tag.jump,
        data: {
          label: "title"
        }
      }
    ])
  ]
});
