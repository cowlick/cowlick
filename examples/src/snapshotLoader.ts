"use strict";
import {engine, Snapshot} from "@cowlick/engine";

module.exports = (snapshot: Snapshot) => {
  g._require(g.game, "load")(engine);
  engine.restore(snapshot);
};
