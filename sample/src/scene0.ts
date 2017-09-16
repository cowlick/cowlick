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
          layer: novel.Layer.background
        }
      },
      {
        tag: novel.Tag.choice,
        data: {
          layer: novel.Layer.system,
          direction: novel.Direction.Horizontal,
          width: 100,
          height: 32,
          x: g.game.width - 220,
          y: g.game.height - 40,
          assetId: null,
          windowTrigger: novel.Trigger.Enable,
          values: [
            {
              tag: "noop",
              data: {},
              text: "メニュー1"
            },
            {
              tag: "noop",
              data: {},
              text: "メニュー2"
            }
          ]
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
          layer: novel.Layer.background
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
          layer: novel.Layer.choice,
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
          ]
        }
      }
    ])
  ]
});