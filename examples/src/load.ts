"use strict";
import * as tl from "@akashic-extension/akashic-timeline";
import * as core from "cowlick-core";
import * as novel from "cowlick-engine";

interface Logo extends core.Fade {
  wait: number;
}

module.exports = (engine: novel.Engine) => {
  engine.script("logo", (controller: novel.SceneController, data: Logo) => {
    const scene = controller.current;
    scene.transition(data.layer, (layer: g.E) => {
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
  engine.script(core.Tag.choice, (controller: novel.SceneController, value: core.Choice) => {
    value.backgroundImage = "pane";
    value.padding = 4;
    value.backgroundEffector = {
      borderWidth: 4
    };
    choiceScript(controller, value);
  });
};
