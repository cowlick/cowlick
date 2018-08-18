"use strict";
import * as core from "@cowlick/core";
import {Config, defaultConfig} from "@cowlick/config";
import {SceneController} from "./components/SceneController";
import {ScriptManager, ScriptFunction} from "./scripts/ScriptManager";
import {defaultScripts} from "./scripts/defaultScripts";
import {createStorageKeys} from "./components/GameStateHelper";
import {Snapshot} from "./models/Snapshot";

export interface EngineParameters {
  game: g.Game;
  player: g.Player;
  config?: Config;
  storageKeys?: g.StorageKey[];
}

/**
 * ノベルエンジン本体。
 */
export class Engine {
  private game: g.Game;
  private static _scriptManager = new ScriptManager(defaultScripts);
  private _config: Config;
  private player: g.Player;
  private storageKeys: g.StorageKey[];

  constructor(params: EngineParameters) {
    this.game = params.game;
    this.player = params.player;

    if (params.config) {
      this._config = params.config;
    } else {
      this._config = defaultConfig();
    }

    if (params.storageKeys) {
      this.storageKeys = params.storageKeys;
    } else {
      this.storageKeys = createStorageKeys(this.player, this.config.system.maxSaveCount);
    }
  }

  static get scriptManager(): ScriptManager {
    return Engine._scriptManager;
  }

  get config(): Config {
    return this._config;
  }

  /**
   * シナリオに登録された最初のシーンを使用してゲームを開始する。
   *
   * @param scenario
   * @param callback
   */
  start(scenario: core.Scenario, callback?: (controller: SceneController) => void) {
    const scene = this.makeScene(scenario);
    scene.loaded.addOnce(() => {
      const controller = new SceneController({
        scene,
        scenario,
        scriptManager: Engine.scriptManager,
        config: this.config,
        player: this.player,
        storageKeys: this.storageKeys
      });
      controller.current.init();
      if (callback) {
        callback(controller);
      }
    });
    this.game.pushScene(scene);
  }

  /**
   * 指定したシーンをロードしてゲームを開始する。
   * 指定するassetはgame.jsonで`"global": true`に設定されている必要がある。
   *
   * @param assetId
   * @param callback
   */
  load(assetId: string, callback?: (controller: SceneController) => void) {
    return this.start(new core.Scenario([g._require(this.game, assetId)]), callback);
  }

  /**
   * ゲームを復元する。
   *
   * @param snapshot
   * @param callback
   */
  restore(snapshot: Snapshot, callback?: (controller: SceneController) => void) {
    // globalでないassetを取得するためのダミーシーン
    const scenes = [
      new core.Scene({
        label: "",
        frames: [
          new core.Frame([
            {
              tag: core.Tag.jump,
              label: snapshot.label
            }
          ])
        ]
      })
    ];
    const scenario = new core.Scenario(scenes);
    const scene = this.makeScene(scenario, snapshot.storageValuesSerialization);
    const controller = new SceneController({
      scene,
      scenario,
      scriptManager: Engine.scriptManager,
      config: this.config,
      player: this.player,
      storageKeys: this.storageKeys
    });
    if (this.game.assets[snapshot.label] === undefined) {
      scene.assetLoaded.add(asset => {
        if (asset.id === snapshot.label) {
          scenes.shift();
          controller.restore(snapshot);
          if (callback) {
            callback(controller);
          }
        }
      });
      scene.prefetch();
    } else {
      scenes.shift();
      controller.restore(snapshot);
      if (callback) {
        callback(controller);
      }
    }
  }

  /**
   * スクリプトを登録する。
   * 登録済みのスクリプト名を指定した場合は動作を上書きする。
   *
   * @param name スクリプト名
   * @param f スクリプトに紐づける関数
   */
  script(name: string, f: ScriptFunction) {
    Engine.scriptManager.register(name, f);
  }

  private makeScene(scenario: core.Scenario, storageValuesSerialization?: g.StorageValueStoreSerialization): g.Scene {
    return SceneController.createSceneForGame({
      game: this.game,
      scenario,
      config: this.config,
      storageKeys: this.storageKeys,
      storageValuesSerialization
    });
  }
}

/**
 * エンジンを準備する。
 *
 * @param game
 * @param player
 */
export const initialize = (game?: g.Game, player?: g.Player) => {
  const assetId = "cowlickConfig";
  let params: EngineParameters = {
    game: game ? game : g.game,
    player: player ? player : {id: "0"}
  };
  if (assetId in params.game.assets) {
    params.config = g._require(params.game, assetId);
  }
  return new Engine(params);
};
