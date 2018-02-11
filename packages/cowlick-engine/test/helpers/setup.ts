"use strict";
import {Context} from "@xnv/headless-akashic";
import "@xnv/headless-akashic/polyfill";

export let config;
export let SaveLoadScene;
export let SceneController;
export let ScriptManager;
export let ScriptFunction;
export let Storage;

let ctx: Context;

beforeEach(function() {
  this.timeout(5000);
  ctx = new Context();
  return ctx.start().then(game => {
    g.game = game;
    config = require("cowlick-config");
    SaveLoadScene = require("../../src/components/SaveLoadScene").SaveLoadScene;
    SceneController = require("../../src/components/SceneController").SceneController;
    ScriptManager = require("../../src/scripts/ScriptManager").ScriptManager;
    ScriptFunction = require("../../src/scripts/ScriptManager").ScriptFunction;
    Storage = require("../../src/models/Storage").Storage;
  });
});

afterEach(() => {
  ctx.end();
});
