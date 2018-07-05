"use strict";
import {Context} from "@xnv/headless-akashic";
import "@xnv/headless-akashic/polyfill";

let ctx: Context;

beforeEach(function() {
  this.timeout(5000);
  ctx = new Context();
  return ctx.start().then(game => {
    g.game = game;
    g.game.width = 640;
    g.game.height = 480;
  });
});

afterEach(() => {
  ctx.end();
});
