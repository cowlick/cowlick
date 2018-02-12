"use strict";
import * as core from "cowlick-core";
import {Config, defaultConfig} from "cowlick-config";
import {SceneController} from "./components/SceneController";
import {ScriptManager, ScriptFunction} from "./scripts/ScriptManager";
import {defaultScripts} from "./scripts/defaultScripts";
import {createStorageKeys} from "./components/GameStateHelper";
import {Snapshot} from "./models/Snapshot";

/**
 * ノベルエンジン本体。
 */
export class Engine {
  private game: g.Game;
  private static _scriptManager = new ScriptManager(defaultScripts);
  private static _config = defaultConfig;
  private player: g.Player;

  constructor(game: g.Game, player: g.Player) {
    this.game = game;
    this.player = player;

    const c = g._require(game, "config");
    if (c) {
      Engine._config = c;
    }
  }

  set config(value: Config) {
    Engine._config = value;
  }

  static get scriptManager(): ScriptManager {
    return Engine._scriptManager;
  }

  static get config(): Config {
    return Engine._config;
  }

  /**
   * シナリオに登録された最初のシーンを使用してゲームを開始する。
   *
   * @param scenario シナリオ
   */
  start(scenario: core.Scenario): SceneController {
    const storageKeys = createStorageKeys(this.player, Engine._config.system.maxSaveCount);

    const controller = new SceneController({
      game: this.game,
      scenario,
      scriptManager: Engine.scriptManager,
      config: Engine.config,
      player: this.player,
      storageKeys
    });
    controller.start();
    return controller;
  }

  /**
   * 指定したシーンをロードしてゲームを開始する。
   * 指定するassetはgame.jsonで`"global": true`に設定されている必要がある。
   *
   * @param assetId
   */
  load(assetId: string): SceneController {
    const s: core.Scene = g._require(this.game, assetId);
    if (s) {
      return this.start(new core.Scenario([s]));
    } else {
      throw new core.GameError("scene not found", {assetId});
    }
  }

  /**
   * ゲームを復元する。
   *
   * @params snapshot
   */
  restore(snapshot: Snapshot): SceneController {
    return SceneController.restore({
      game: this.game,
      scriptManager: Engine.scriptManager,
      config: Engine.config,
      player: this.player,
      snapshot
    });
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
}
