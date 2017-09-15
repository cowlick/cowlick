"use strict";
import * as novel from "../../lib/index";

function main() {
  novel.engine.start(new novel.Scenario([
    new novel.Scene([
      new novel.Frame(
        [
          {
            id: "black"
          }
        ],
        "Hello\nAkashic Novel!"
      ),
      new novel.Frame(
        [
          {
            id: "black"
          }
        ],
        "<ruby>ルビのテスト<rt>テスト</rt></ruby>"
      ),
      new novel.Frame(
        [],
        "画像が指定なされていない場合は前フレームを引き継ぐ"
      )
    ])
  ]));
}

module.exports = main;
