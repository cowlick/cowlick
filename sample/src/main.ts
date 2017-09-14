"use strict";
import {engine, Scenario} from "../../lib/index";

function main() {
  engine.start(new Scenario([
    "Hello\nAkashic Novel!",
    "<ruby>ルビのテスト<rt>テスト</rt></ruby>"
  ]));
}

module.exports = main;
