"use strict";
import * as novel from "../../lib/index";
import {scene0} from "./scene0";
import {scene1} from "./scene1";
import {scene2} from "./scene2";

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
    scene0,
    scene1,
    scene2
  ]));
}

module.exports = main;
