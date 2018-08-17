"use strict";
import {Scenario} from "@cowlick/core";
import {initialize, SceneController} from "@cowlick/engine";

module.exports = (param: g.GameMainParameterObject) => {
  if (param.snapshot) {
    require("snapshotLoader")(param.snapshot);
  } else {
    const engine = initialize(g.game);
    require("load")(engine);
    let controller: SceneController | undefined;

    g.game.snapshotRequest.add(() => {
      if (g.game.shouldSaveSnapshot()) {
        if (controller) {
          g.game.saveSnapshot(controller.snapshot());
        }
      }
    });

    engine.load("first", (c: SceneController) => {
      controller = c;
    });
  }
};
