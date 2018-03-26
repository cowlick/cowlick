"use strict";
import {engine} from "cowlick-engine";

module.exports = (param: g.GameMainParameterObject) => {
  if (param.snapshot) {
    require("snapshotLoader")(param.snapshot);
  } else {
    require("load")(engine);
    const controller = engine.load("first");

    g.game.snapshotRequest.add(() => {
      if (g.game.shouldSaveSnapshot()) {
        g.game.saveSnapshot(controller.snapshot());
      }
    });
  }
};
