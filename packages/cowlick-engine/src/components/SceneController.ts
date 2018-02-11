"use strict";
import * as core from "cowlick-core";
import {Config} from "cowlick-config";
import {Scene} from "./Scene";
import {GameScene} from "./GameScene";
import {SaveLoadScene} from "./SaveLoadScene";
import {ScriptManager} from "../scripts/ScriptManager";

export interface SceneControllerParameters {
  game: g.Game;
  scenario: core.Scenario;
  scriptManager: ScriptManager;
  config: Config;
  player: g.Player;
  storageKeys: g.StorageKey[];
}

export class SceneController implements g.Destroyable {
  game: g.Game;
  private player: g.Player;
  private config: Config;
  private scenario: core.Scenario;
  private scriptManager: ScriptManager;
  private storageKeys: g.StorageKey[];

  private _current: GameScene;
  private saveLoadScene: SaveLoadScene;

  constructor(params: SceneControllerParameters) {
    this.game = params.game;
    this.scenario = params.scenario;
    this.scriptManager = params.scriptManager;
    this.config = params.config;
    this.player = params.player;
    this.storageKeys = params.storageKeys;
    this._current = new GameScene({
      game: this.game,
      scenario: this.scenario,
      scriptManager: this.scriptManager,
      config: this.config,
      controller: this,
      player: this.player,
      storageKeys: this.storageKeys
    });
    this._current.loaded.addOnce(() => {
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

  get current(): GameScene {
    return this._current;
  }

  get backlog(): core.Log[] {
    return this.scenario.backlog;
  }

  start() {
    const scene = this.game.scene();
    if (scene !== this._current && scene !== this.saveLoadScene) {
      this.game.pushScene(this._current);
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
      this.scenario.update(this.game, {
        label: s.label,
        frame: s.logs[0].frame
      });
      this.loadScene(() => {
        for (const l of s.logs.slice(1)) {
          this.jump({
            label: s.label,
            frame: l.frame
          });
        }
      });
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
    const current = this._current;
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
    } else if (!this.saveLoadScene.destroyed()) {
      this.destroy();
    }
    this.saveLoadScene = undefined;
    if (scene === current) {
      this.game.popScene();
    }
    this._current = undefined;
    this.player = undefined;
    this.scenario = undefined;
    this.config = undefined;
    this.scriptManager = undefined;
    this.storageKeys = undefined;
    this.game = undefined;
  }

  destroyed() {
    return !this._current;
  }

  private loadScene(callback?: () => void) {
    this.scenario.clear();
    const previousLoadScene = this.saveLoadScene;
    const previousGameScene = this._current;
    this._current = new GameScene({
      game: this.game,
      scenario: this.scenario,
      scriptManager: this.scriptManager,
      config: this.config,
      controller: this,
      player: this.player,
      storageKeys: this.storageKeys,
      state: this._current.gameState
    });
    this._current.loaded.addOnce(() => {
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
    previousLoadScene.stateChanged.add(state => {
      if (state === g.SceneState.Destroyed) {
        this.game.replaceScene(this._current);
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
  }

  private collectAssetIds(): string[] {
    return this._current.gameState.collectAssetIds(this.game);
  }
}
