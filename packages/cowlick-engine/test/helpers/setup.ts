"use strict";
import {Context} from "@xnv/headless-akashic";
import "@xnv/headless-akashic/polyfill";

export let config;
export let GameState;
export let SaveLoadScene;
export let SceneController;
export let ScriptManager;
export let ScriptFunction;
export let Storage;

beforeEach(() => {
  const ctx = new Context();
  return ctx.start().then(game => {
    g.game = game;
    config = require("cowlick-config");
    GameState = require("../../src/models/GameState").GameState;
    SaveLoadScene = require("../../src/components/SaveLoadScene").SaveLoadScene;
    SceneController = require("../../src/components/SceneController").SceneController;
    ScriptManager = require("../../src/scripts/ScriptManager").ScriptManager;
    ScriptFunction = require("../../src/scripts/ScriptManager").ScriptFunction;
    Storage = require("../../src/models/Storage").Storage;
  });
});
