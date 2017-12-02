"use strict";
import {Context} from "@xnv/headless-akashic";
import "@xnv/headless-akashic/polyfill";

export let core;
export let GameState;
export let SaveLoadScene;
export let SceneController;
export let ScriptManager;
export let ScriptFunction;
export let Storage;

beforeEach(done => {
  const ctx = new Context();
  ctx.start().then((game: g.Game) => {
    g.game = game;
    core = require("cowlick-core");
    GameState = require("../../src/models/GameState").GameState;
    SaveLoadScene = require("../../src/components/SaveLoadScene").SaveLoadScene;
    SceneController = require("../../src/components/SceneController").SceneController;
    ScriptManager = require("../../src/scripts/ScriptManager").ScriptManager;
    ScriptFunction = require("../../src/scripts/ScriptManager").ScriptFunction;
    Storage = require("../../src/models/Storage").Storage;
    done();
  });
});
