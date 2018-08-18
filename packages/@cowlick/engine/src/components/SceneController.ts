"use strict";
import * as core from "@cowlick/core";
import {Config} from "@cowlick/config";
import {Scene} from "./Scene";
import {GameScene} from "./GameScene";
import {SaveLoadScene} from "./SaveLoadScene";
import {loadGameState} from "./GameStateHelper";
import {ScriptManager} from "../scripts/ScriptManager";
import {Snapshot} from "../models/Snapshot";

export interface SceneControllerParameters {
  scene: g.Scene;
  scenario: core.Scenario;
  scriptManager: ScriptManager;
  config: Config;
  player: g.Player;
  storageKeys: g.StorageKey[];
}

export interface SceneParameters {
  game: g.Game;
  scenario: core.Scenario;
  config: Config;
  storageKeys: g.StorageKey[];
  storageValuesSerialization?: g.StorageValueStoreSerialization;
}

export class SceneController implements g.Destroyable {
  game: g.Game;
  config: Config;
  current: GameScene;

  private player: g.Player;
  private scenario: core.Scenario;
  private scriptManager: ScriptManager;
  private storageKeys: g.StorageKey[];

  private saveLoadSceneBody: g.Scene;
  private saveLoadScene: SaveLoadScene | undefined;

  constructor(params: SceneControllerParameters) {
    this.game = params.scene.game;
    this.scenario = params.scenario;
    this.scriptManager = params.scriptManager;
    this.config = params.config;
    this.player = params.player;
    this.storageKeys = params.storageKeys;
    this.current = new GameScene({
      scene: params.scene,
      scenario: this.scenario,
      scriptManager: this.scriptManager,
      config: this.config,
      controller: this,
      player: this.player,
      state: loadGameState(params.scene, params.storageKeys, params.config, params.scenario)
    });
    this.saveLoadSceneBody = this.makeSaveLoadScene();
  }

  get backlog(): core.Log[] {
    return this.scenario.backlog;
  }

  snapshot(): Snapshot {
    return {
      ...this.current.gameState.createSnapshot(),
      storageKeys: this.storageKeys,
      storageValuesSerialization: this.current.body.serializeStorageValues()
    };
  }

  jump(target: core.Jump, callback?: () => void) {
    const previous = this.scenario.scene.label;
    this.scenario.update(this.game, target);
    if (previous === this.scenario.scene.label) {
      this.scenario.load();
    } else {
      this.loadScene(callback);
    }
  }

  save(data: core.Save) {
    this.current.save(data);
  }

  load(data: core.Load) {
    const s = this.current.load(data.index);
    if (s) {
      this.jump(
        {
          tag: core.Tag.jump,
          label: s.label,
          frame: s.logs[0].frame
        },
        () => this.skip(s)
      );
    } else {
      throw new core.GameError("save data not found", data);
    }
  }

  openSaveLoadScene(onLoaded: (scene: Scene) => void) {
    this.saveLoadSceneBody.loaded.addOnce(() => {
      this.saveLoadScene = new SaveLoadScene({
        scene: this.saveLoadSceneBody,
        config: this.config,
        gameState: this.current.gameState
      });
      onLoaded(this.saveLoadScene);
    });
    this.game.pushScene(this.saveLoadSceneBody);
    return this.saveLoadScene;
  }

  closeSaveLoadScene() {
    if (this.saveLoadScene) {
      this.saveLoadScene.close();
    } else {
      throw new core.GameError("セーブシーン、ロードシーンが存在しません");
    }
  }

  destroy() {
    const scene = this.game.scene();
    const current = this.current.body;
    if (scene === this.saveLoadSceneBody) {
      // popSceneのリクエスト直後だとcurrentのpopが行われない可能性があるので、破棄後に再度確認する
      this.saveLoadSceneBody.stateChanged.add(status => {
        if (status === g.SceneState.Destroyed) {
          if (this.game.scene() === current) {
            this.game.popScene();
          }
        }
      }, this);
      this.game.popScene();
    } else if (this.saveLoadSceneBody.destroyed() == false) {
      this.saveLoadSceneBody.destroy();
    }
    if (scene === current) {
      this.game.popScene();
    }
  }

  destroyed() {
    return this.current.body.destroyed();
  }

  restore(snapshot: Snapshot) {
    this.scenario.update(this.game, {tag: core.Tag.jump, label: snapshot.label});
    this.loadScene(() => this.skip(snapshot));
  }

  static createSceneForGame(params: SceneParameters) {
    const assetIds = params.scenario.scene.assetIds.concat(core.collectAssetIds(params.config.window.system));
    if (params.config.window.message.ui.backgroundImage) {
      assetIds.push(params.config.window.message.ui.backgroundImage);
    }
    return new g.Scene({
      game: params.game,
      assetIds,
      storageKeys: params.storageKeys,
      storageValuesSerialization: params.storageValuesSerialization
    });
  }

  private loadScene(callback?: () => void) {
    this.scenario.clear();
    const previousLoadScene = this.saveLoadSceneBody;
    const previousGameScene = this.current.body;
    const scene = SceneController.createSceneForGame({
      game: this.game,
      scenario: this.scenario,
      config: this.config,
      storageKeys: this.storageKeys
    });
    scene.loaded.addOnce(() => {
      this.current = new GameScene({
        scene,
        scenario: this.scenario,
        scriptManager: this.scriptManager,
        config: this.config,
        controller: this,
        player: this.player,
        state: this.current.gameState
      });
      this.current.init();
      if (callback) {
        callback();
      }

      this.saveLoadSceneBody = this.makeSaveLoadScene();
    }, this);
    previousLoadScene.stateChanged.add(state => {
      if (state === g.SceneState.Destroyed) {
        if (this.game.scene() === previousGameScene) {
          this.game.replaceScene(scene);
        } else {
          this.game.pushScene(scene);
        }
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

  private makeSaveLoadScene() {
    const assetIds = this.scenario.scene.assetIds.concat(
      core.collectAssetIds(this.config.window.system),
      this.current.gameState.collectAssetIds(this.game)
    );
    if (this.config.window.message.ui.backgroundImage) {
      assetIds.push(this.config.window.message.ui.backgroundImage);
    }
    const scene = new g.Scene({
      game: this.game,
      assetIds
    });
    scene.prefetch();
    return scene;
  }

  private skip(data: core.SaveData) {
    for (const l of data.logs.slice(1)) {
      this.jump({
        tag: core.Tag.jump,
        label: data.label,
        frame: l.frame
      });
    }
  }
}
