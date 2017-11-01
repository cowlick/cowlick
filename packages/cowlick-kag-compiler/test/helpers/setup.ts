"use strict";
import { Context } from "@xnv/headless-akashic";
import "@xnv/headless-akashic/polyfill";

export let Scenario;
export let analyze;

beforeEach((done) => {
  const ctx = new Context();
  ctx.start().then((game: g.Game) => {
    g.game = game;
    const analyzer = require("cowlick-analyzer");
    Scenario = analyzer.Scene;
    analyze = analyzer.analyze;
    done();
  });
});
