"use strict";
import * as novel from "../../lib/index";

function main() {

  novel.engine.script("noop", (scene, data) => {});

  novel.engine.config = {
    pane: {
      assetId: "pane"
    },
    font: {
      color: "white"
    }
  };

  novel.engine.start(new novel.Scenario([
    new novel.Scene({
      label: "0",
      frames: [
        new novel.Frame(
          [
            {
              tag: "image",
              data: {
                assetId: "black",
                layer: "background"
              }
            },
            {
              tag: "choice",
              data: {
                layer: "system",
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
            }
          ],
          "Hello\nAkashic Novel!"
        ),
        new novel.Frame(
          [
            {
              tag: "image",
              data: {
                assetId: "black",
                layer: "background"
              }
            }
          ],
          "<ruby>ルビのテスト<rt>テスト</rt></ruby>"
        ),
        new novel.Frame(
          [],
          "画像が指定なされていない場合は前フレームを引き継ぐ"
        ),
        new novel.Frame(
          [
            {
              tag: "choice",
              data: {
                layer: "choice",
                values: [
                  {
                    tag: "jump",
                    data: {
                      label: "1"  
                    },
                    text: "シーン1へ"
                  },
                  {
                    tag: "jump",
                    data: {
                      label: "2"
                    },
                    text: "シーン2へ"
                  }
                ]
              }
            }
          ]
        )
      ]
    }),
    new novel.Scene({
      label: "1",
      frames: [
        new novel.Frame(
          [
            {
              tag: "image",
              data: {
                assetId: "black",
                layer: "background"
              }
            }
          ],
          "シーン1です"
        )
      ]
    }),
    new novel.Scene({
      label: "2",
      frames: [
        new novel.Frame(
          [
            {
              tag: "image",
              data: {
                assetId: "black",
                layer: "background"
              }
            }
          ],
          "シーン2です"
        )
      ]
    })
  ]));
}

module.exports = main;
