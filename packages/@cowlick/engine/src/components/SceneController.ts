"use strict";
import * as core from "@cowlick/core";
import {Config} from "@cowlick/config";
import {Scene} from "./Scene";
import {GameScene} from "./GameScene";
import {SaveLoadScene} from "./SaveLoadScene";
import {ScriptManager} from "../scripts/ScriptManager";
import {Snapshot} from "../models/Snapshot";

export interface SceneControllerParameters {
  game: g.Game;
  scenario: core.Scenario;
  scriptManager: ScriptManager;
  config: Config;
  player: g.Player;
  storageKeys: g.StorageKey[];
  storageValuesSerialization?: g.StorageValueStoreSerialization;
}

export interface SceneRestoreParameters {
  game: g.Game;
  scriptManager: ScriptManager;
  config: Config;
  player: g.Player;
  snapshot: Snapshot;
}

export class SceneController implements g.Destroyable {
  game: g.Game;
  config: Config;
  current: GameScene;

  private player: g.Player;
  private scenario: core.Scenario;
  private scriptManager: ScriptManager;
  private storageKeys: g.StorageKey[];

  private saveLoadScene: SaveLoadScene;

  constructor(params: SceneControllerParameters) {
    this.game = params.game;
    this.scenario = params.scenario;
    this.scriptManager = params.scriptManager;
    this.config = params.config;
    this.player = params.player;
    this.storageKeys = params.storageKeys;
    this.current = new GameScene({
      game: this.game,
      scenario: this.scenario,
      scriptManager: this.scriptManager,
      config: this.config,
      controller: this,
      player: this.player,
      storageKeys: this.storageKeys,
      storageValuesSerialization: params.storageValuesSerialization
    });
    this.current.loaded.addOnce(() => {
      this.saveLoadScene = new SaveLoadScene({
        game: this.game,
        scene: this.scenario.scene,
        config: this.config,
        assetIds: this.collectAssetIds(),
        gameState: this.current.gameState
      });
      this.saveLoadScene.prefetch();
    }, this);
  }

  get backlog(): core.Log[] {
    return this.scenario.backlog;
  }

  snapshot(): Snapshot {
    return this.current.snapshot();
  }

  start() {
    const scene = this.game.scene();
    if (scene !== this.current && scene !== this.saveLoadScene) {
      this.game.pushScene(this.current);
    }
  }

  jump(target: core.Jump) {
    const previous = this.scenario.scene.label;
    this.scenario.update(this.game, target);
    if (previous === this.scenario.scene.label) {
      this.scenario.load();
    } else {
      this.loadScene();
    }
  }

  save(data: core.Save) {
    this.current.save(data);
  }

  load(data: core.Load) {
    const s = this.current.load(data.index);
    if (s) {
      this.loadFromSaveData(s);
    } else {
      throw new core.GameError("save data not found", data);
    }
  }

  openSaveLoadScene(): Scene {
    this.game.pushScene(this.saveLoadScene);
    return this.saveLoadScene;
  }

  closeSaveLoadScene() {
    this.saveLoadScene.close();
  }

  destroy() {
    const scene = this.game.scene();
    const current = this.current;
    if (scene === this.saveLoadScene) {
      // popSceneのリクエスト直後だとcurrentのpopが行われない可能性があるので、破棄後に再度確認する
      this.saveLoadScene.stateChanged.add(status => {
        if (status === g.SceneState.Destroyed) {
          if (this.game.scene() === current) {
            this.game.popScene();
          }
        }
      }, this);
      this.game.popScene();
    } else if (this.saveLoadScene.destroyed() == false) {
      this.saveLoadScene.destroy();
    }
    this.saveLoadScene = undefined;
    if (scene === current) {
      this.game.popScene();
    }
    this.current = undefined;
    this.player = undefined;
    this.scenario = undefined;
    this.config = undefined;
    this.scriptManager = undefined;
    this.storageKeys = undefined;
    this.game = undefined;
  }

  destroyed() {
    return !this.current;
  }

  static restore(params: SceneRestoreParameters): SceneController {
    const scenes = SceneController.fakeScenes(params.snapshot.label);
    const controller = new SceneController({
      game: params.game,
      scriptManager: params.scriptManager,
      config: params.config,
      player: params.player,
      scenario: new core.Scenario(scenes),
      storageKeys: params.snapshot.storageKeys,
      storageValuesSerialization: params.snapshot.storageValuesSerialization
    });
    if (params.game.assets[params.snapshot.label] === undefined) {
      controller.current.assetLoaded.add(asset => {
        if (asset.id === params.snapshot.label) {
          scenes.shift();
          controller.loadFromSaveData(params.snapshot);
        }
      });
      controller.current.prefetch();
    } else {
      scenes.shift();
      controller.loadFromSaveData(params.snapshot);
    }
    return controller;
  }

  private loadScene(callback?: () => void) {
    this.scenario.clear();
    const previousLoadScene = this.saveLoadScene;
    const previousGameScene = this.current;
    this.current = new GameScene({
      game: this.game,
      scenario: this.scenario,
      scriptManager: this.scriptManager,
      config: this.config,
      controller: this,
      player: this.player,
      storageKeys: this.storageKeys,
      state: this.current.gameState
    });
    this.current.loaded.addOnce(() => {
      if (callback) {
        callback();
      }
      this.saveLoadScene = new SaveLoadScene({
        game: this.game,
        scene: this.scenario.scene,
        config: this.config,
        assetIds: this.collectAssetIds(),
        gameState: this.current.gameState
      });
      this.saveLoadScene.prefetch();
    }, this);
    if (previousLoadScene) {
      previousLoadScene.stateChanged.add(state => {
        if (state === g.SceneState.Destroyed) {
          this.game.replaceScene(this.current);
        }
      }, this);
      switch (previousLoadScene.state) {
        case g.SceneState.Standby:
          previousLoadScene.destroy();
          break;
        case g.SceneState.Active:
          // popが終わっていない可能性があるので、1フレーム待ってから破棄する
          previousGameScene.setTimeout(() => previousLoadScene.destroy(), this.game.fps, this);
          break;
      }
    } else if (this.game.scene() === previousGameScene) {
      this.game.replaceScene(this.current);
    } else {
      this.game.pushScene(this.current);
    }
  }

  private collectAssetIds(): string[] {
    return this.current.gameState.collectAssetIds(this.game);
  }

  private loadFromSaveData(data: core.SaveData) {
    this.scenario.update(this.game, {
      tag: core.Tag.jump,
      label: data.label,
      frame: data.logs[0].frame
    });
    this.loadScene(() => {
      for (const l of data.logs.slice(1)) {
        this.jump({
          tag: core.Tag.jump,
          label: data.label,
          frame: l.frame
        });
      }
    });
  }

  // globalでないassetを取得するためのダミーシーン
  private static fakeScenes(label: string): core.Scene[] {
    return [
      new core.Scene({
        label: "",
        frames: [
          new core.Frame([
            {
              tag: core.Tag.extension,
              data: {
                tag: "",
                label
              }
            }
          ])
        ]
      })
    ];
  }
}
