"use strict";
import {Snapshot, Engine} from "@cowlick/engine";

module.exports = (snapshot: Snapshot) => {
  const engine = new Engine({
    game: g.game,
    player: {id: "0"},
    config: g._require(g.game, "cowlickConfig"),
    storageKeys: snapshot.storageKeys
  });
  require("load")(engine);
  engine.restore(snapshot);
};
