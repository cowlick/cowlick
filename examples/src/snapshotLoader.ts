"use strict";
import {initialize, Snapshot} from "@cowlick/engine";

module.exports = (snapshot: Snapshot) => {
  const engine = initialize(g.game);
  g._require(g.game, "load")(engine);
  engine.restore(snapshot);
};
