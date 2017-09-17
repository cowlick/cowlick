"use strict";
import * as tl from "@akashic-extension/akashic-timeline";
import * as novel from "../../lib/index";
import {logo} from "./logo";
import {title} from "./title";
import {scene0} from "./scene0";
import {scene1} from "./scene1";
import {scene2} from "./scene2";

interface Logo {
  layer: string;
  duration: number;
  wait: number;
}

function main() {

  novel.engine.script("noop", (scene, data) => {});
  novel.engine.script("logo", (scene, data: Logo) => {
    scene.transition(
      data.layer,
      (layer) => {
        let timeline = new tl.Timeline(scene);
        timeline.create(layer, {modified: layer.invalidate, destroyed: layer.destroyed})
          .fadeIn(data.duration)
          .wait(data.wait)
          .fadeOut(data.duration)
          .call(() => scene.requestNextFrame());
      }
    );
  });

  novel.engine.config = {
    pane: {
      assetId: "pane"
    },
    font: {
      color: "white"
    }
  };

  novel.engine.start(new novel.Scenario([
    logo,
    title,
    scene0,
    scene1,
    scene2
  ]));
}

module.exports = main;
