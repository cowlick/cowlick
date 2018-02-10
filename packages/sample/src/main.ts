"use strict";
import * as tl from "@akashic-extension/akashic-timeline";
import * as core from "cowlick-core";
import * as novel from "cowlick-engine";

interface Logo extends core.Fade {
  wait: number;
}

function main() {
  novel.engine.script("logo", (controller, data: Logo) => {
    const scene = controller.current;
    scene.transition(data.layer, layer => {
      let timeline = new tl.Timeline(scene);
      timeline
        .create(layer, {modified: layer.modified, destroyed: layer.destroyed})
        .fadeIn(data.duration)
        .wait(data.wait)
        .fadeOut(data.duration)
        .call(() => scene.requestNextFrame());
    });
  });

  const choiceScript = novel.defaultScripts.get(core.Tag.choice);
  novel.engine.script(core.Tag.choice, (controller, value: core.Choice) => {
    value.backgroundImage = "pane";
    value.padding = 4;
    value.backgroundEffector = {
      borderWidth: 4
    };
    choiceScript(controller, value);
  });

  novel.engine.load("first");
}

module.exports = main;
