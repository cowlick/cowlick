"use strict";
import * as novel from "../../lib/index";

function main() {
  novel.engine.start(new novel.Scenario([
    new novel.Scene({
      id: "0",
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
              data: [
                {
                  sceneId: "1",
                  text: "シーン1へ"
                },
                {
                  sceneId: "2",
                  text: "シーン2へ"
                }
              ]
            }
          ]
        )
      ]
    }),
    new novel.Scene({
      id: "1",
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
      id: "2",
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
