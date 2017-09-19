"use strict";
import * as novel from "../../lib/index";

export const scene0 = new novel.Scene({
  label: "0",
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
          value: "Hello\nAkashic Novel!"
        }
      }
    ]),
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
          value: "<ruby>ルビのテスト<rt>テスト</rt></ruby>"
        }
      }
    ]),
    new novel.Frame([
      {
        tag: novel.Tag.evaluate,
        data: {
          path: "eval"
        }
      },
      {
        tag: novel.Tag.text,
        data: {
          value: "画像が指定なされていない場合は前フレームを引き継ぐ"
        }
      }
    ]),
    new novel.Frame([
      {
        tag: novel.Tag.choice,
        data: {
          layer: {
            name: novel.Layer.choice
          },
          values: [
            {
              tag: novel.Tag.jump,
              data: {
                label: "1"
              },
              text: "シーン1へ"
            },
            {
              tag: novel.Tag.jump,
              data: {
                label: "2"
              },
              text: "シーン2へ"
            }
          ],
          backgroundImage: "pane",
          padding: 4,
          backgroundEffector: {
            borderWidth: 4
          }
        }
      },
      {
        tag: novel.Tag.trigger,
        data: novel.Trigger.Off
      }
    ])
  ]
});
