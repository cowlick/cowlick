"use strict";
import "./helpers/setup";
import "@xnv/headless-akashic/polyfill";
import * as assert from "assert";
import * as core from "@cowlick/core";
import * as config from "@cowlick/config";
import {GameState} from "../src/models/GameState";
import {ScriptManager} from "../src/scripts/ScriptManager";
import {SaveLoadScene} from "../src/components/SaveLoadScene";
import {SceneController} from "../src/components/SceneController";
import {defaultScripts} from "../src/scripts/defaultScripts";

describe("SceneController", () => {
  function createController(config: config.Config, scriptManager: ScriptManager) {
    const scenario = new core.Scenario([
      new core.Scene({
        label: "0",
        frames: [
          new core.Frame([
            {
              tag: core.Tag.jump,
              label: "1",
              frame: 0
            }
          ])
        ]
      }),
      new core.Scene({
        label: "1",
        frames: [
          new core.Frame([
            {
              tag: core.Tag.jump,
              label: "0",
              frame: 0
            }
          ])
        ]
      })
    ]);
    const controller = new SceneController({
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
        logs: [
          {
            frame: 0
          }
        ],
        variables: {}
      }
    ];
    const variables = {
      builtin: {
        selectedFont: 0,
        audoMode: false,
        autoMessageDuration: config.system.autoMessageDuration
      },
      current: {},
      system: {}
    };
    (controller.current as any)._gameState = new GameState({
      data,
      variables,
      max: config.system.maxSaveCount,
      scenario
    });
    (controller as any).saveLoadScene = new SaveLoadScene({
      game: g.game,
      scene: scenario.scene,
      config,
      assetIds: [],
      gameState: controller.current.gameState
    });
    return controller;
  }

  it("ロードシーンからゲームシーンに遷移できる", () => {
    const scriptManager = new ScriptManager(defaultScripts);
    const controller = createController(config.defaultConfig(), scriptManager);
    (controller as any).saveLoadScene.stateChanged.add((state: g.SceneState) => {
      if (state === g.SceneState.Active) {
        scriptManager.call(controller, {tag: core.Tag.closeLoadScene});
        controller.jump({
          tag: core.Tag.jump,
          label: "1",
          frame: 0
        });
      }
    }, this);
    controller.start();
    scriptManager.call(controller, {
      tag: core.Tag.openLoadScene,
      vertical: 10,
      horizontal: 1,
      button: 0,
      padding: 10,
      base: {
        tag: core.Tag.pane,
        layer: {
          name: core.LayerKind.system,
          x: 10,
          y: 10
        },
        width: 580,
        height: 30
      }
    });
  });

  it("破棄できる", () => {
    const scriptManager = new ScriptManager(defaultScripts);
    const controller = createController(config.defaultConfig(), scriptManager);
    controller.current.stateChanged.add(state => {
      if (state === g.SceneState.Active) {
        controller.destroy();
      }
    }, this);
    controller.start();
  });
});
