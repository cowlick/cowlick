"use strict";
import * as core from "@cowlick/core";
import {Config, defaultConfig} from "@cowlick/config";
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
  config: Config;
  private player: g.Player;

  constructor(game: g.Game, player: g.Player) {
    this.game = game;
    this.player = player;
    this.config = defaultConfig();

    const assetId = "cowlickConfig";
    if (game.assets[assetId] !== undefined) {
      this.config = g._require(game, assetId);
    }
  }

  static get scriptManager(): ScriptManager {
    return Engine._scriptManager;
  }

  /**
   * シナリオに登録された最初のシーンを使用してゲームを開始する。
   *
   * @param scenario シナリオ
   */
  start(scenario: core.Scenario): SceneController {
    const storageKeys = createStorageKeys(this.player, this.config.system.maxSaveCount);

    const controller = new SceneController({
      game: this.game,
      scenario,
      scriptManager: Engine.scriptManager,
      config: this.config,
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
    return this.start(new core.Scenario([g._require(this.game, assetId)]));
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
      config: this.config,
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

/**
 * エンジンを準備する。
 *
 * @param game
 * @param player
 */
export const initialize = (game?: g.Game, player?: g.Player) => {
  return new Engine(game ? game : g.game, player ? player : {id: "0"});
};
