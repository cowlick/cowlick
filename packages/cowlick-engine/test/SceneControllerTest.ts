"use strict";
import * as assert from "assert";
import * as core from "cowlick-core";
import * as engine from "./helpers/setup";

describe("SceneController", () => {
  function createController(config: engine.config.Config, scriptManager: engine.ScriptManager) {
    const scenario = new core.Scenario([
      new core.Scene({
        label: "0",
        frames: [
          new core.Frame([
            {
              tag: "jump",
              data: {
                label: "1",
                frame: 0
              }
            }
          ])
        ]
      }),
      new core.Scene({
        label: "1",
        frames: [
          new core.Frame([
            {
              tag: "jump",
              data: {
                label: "0",
                frame: 0
              }
            }
          ])
        ]
      })
    ]);
    const controller = new engine.SceneController({
      game: g.game,
      scenario,
      player: {id: "0"},
      config,
      scriptManager,
      storageKeys: []
    });
    const data = [
      {
        label: "1",
        frame: 0,
        variables: {}
      }
    ];
    const vars = {
      builtin: {
        selectedFont: 0,
        audoMode: false,
        autoMessageDuration: config.system.autoMessageDuration
      },
      current: {},
      system: {}
    };
    controller.current._gameState = new engine.GameState(data, vars, config.system.maxSaveCount);
    controller.saveLoadScene = new engine.SaveLoadScene({
      game: g.game,
      scene: scenario.scene,
      config,
      assetIds: [],
      gameState: controller.current.gameState
    });
    return controller;
  }

  it("ロードシーンからゲームシーンに遷移できる", () => {
    const config = engine.config.defaultConfig;
    const defaultScripts = require("../src/scripts/defaultScripts").defaultScripts;
    const scriptManager = new engine.ScriptManager(defaultScripts);
    const controller = createController(config, scriptManager);
    controller.saveLoadScene.stateChanged.add(state => {
      if (state === g.SceneState.Active) {
        scriptManager.call(controller, {tag: "closeLoadScene"});
        controller.jump({
          label: "1",
          frame: 0
        });
      }
    }, this);
    controller.start();
    scriptManager.call(controller, {
      tag: core.Tag.openLoadScene,
      data: {
        vertical: 10,
        horizontal: 1,
        button: 0,
        padding: 10,
        base: {
          layer: {
            name: core.Layer.system,
            x: 10,
            y: 10
          },
          width: 580,
          height: 30
        }
      }
    });
  });

  it("破棄できる", () => {
    const config = engine.config.defaultConfig;
    const defaultScripts = require("../src/scripts/defaultScripts").defaultScripts;
    const scriptManager = new engine.ScriptManager(defaultScripts);
    const controller = createController(config, scriptManager);
    controller.current.stateChanged.add(state => {
      if (state === g.SceneState.Active) {
        controller.destroy();
      }
    }, this);
    controller.start();
  });
});
