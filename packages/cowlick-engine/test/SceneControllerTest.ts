"use strict";
import * as assert from "assert";
import * as engine from "./helpers/setup";

describe("SceneController", () => {
  it("ロードシーンからゲームシーンに遷移できる", () => {
    const config = engine.core.defaultConfig;
    const defaultScripts = require("../src/scripts/defaultScripts").defaultScripts;
    const scriptManager = new engine.ScriptManager(defaultScripts);
    const scenario = new engine.core.Scenario([
      new engine.core.Scene({
        label: "0",
        frames: [
          new engine.core.Frame([
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
      new engine.core.Scene({
        label: "1",
        frames: [
          new engine.core.Frame([
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
      player: { id: "0" },
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
        autoMilliSeconds: config.system.autoMessageSpeed
      },
      current: {},
      system: {}
    };
    controller.current._gameState = new engine.GameState(data, vars, config.system.maxSaveCount);
    controller.start();
    controller.saveLoadScene = new engine.SaveLoadScene({
      game: g.game,
      scene: scenario.scene,
      config,
      assetIds: [],
      gameState: controller.current.gameState
    });
    controller.saveLoadScene.stateChanged.add(
      (state) => {
        if(state === g.SceneState.Active) {
          scriptManager.call(controller, { tag: "closeLoadScene" });
          controller.jump({
            label: "1",
            frame: 0
          });
        }
      },
      this
    );
    scriptManager.call(controller, {
      tag: engine.core.Tag.openLoadScene,
      data: {
        vertical: 10,
        horizontal: 1,
        button: 0,
        padding: 10,
        base: {
          layer: {
            name: engine.core.Layer.system,
            x: 10,
            y: 10
          },
          width: 580,
          height: 30
        }
      }
    });
  });
});