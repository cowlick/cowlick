"use strict";
import * as tl from "@akashic-extension/akashic-timeline";
import * as novel from "../../lib/index";

interface Logo {
  layer: string;
  duration: number;
  wait: number;
}

function main() {

  novel.engine.script("noop", (controller, data) => {});
  novel.engine.script("logo", (controller, data: Logo) => {
    const scene = controller.current;
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

  novel.engine.start();
}

module.exports = main;
