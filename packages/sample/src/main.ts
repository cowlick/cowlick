"use strict";
import {engine} from "cowlick-engine";

module.exports = () => {
  g._require(g.game, "load")(engine);
  const controller = engine.load("first");

  g.game.snapshotRequest.add(() => {
    if (g.game.shouldSaveSnapshot()) {
      g.game.saveSnapshot(controller.snapshot());
    }
  });
};
