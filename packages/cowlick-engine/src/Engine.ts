"use strict";
import * as core from "cowlick-core";
import {SceneController} from "./components/SceneController";
import {ScriptManager, ScriptFunction} from "./scripts/ScriptManager";
import {defaultScripts} from "./scripts/defaultScripts";
import {createStorageKeys} from "./components/GameStateHelper";

/**
 * ノベルエンジン本体。
 */
export class Engine {

  private game: g.Game;
  private static _scriptManager = new ScriptManager(defaultScripts);
  private static _config = core.defaultConfig;
  // 仮置き
  static player: g.Player = { id: "0" };

  constructor(game: g.Game) {
    this.game = game;

    const c = g._require(game, "config");
    if(c) {
      Engine._config = c;
    }
  }

  set config(value: core.Config) {
    Engine._config = value;
  }

  static get scriptManager(): ScriptManager {
    return Engine._scriptManager;
  }

  static get config(): core.Config {
    return Engine._config;
  }

  /**
   * シナリオを元にゲームを開始する。
   *
   * @param scenario シナリオデータ。省略した場合は"scenario.js"からシナリオをロードする。
   */
  start(scenario?: core.Scenario): void {

    const s = scenario ? scenario : core.Scenario.load(this.game);

    const storageKeys = createStorageKeys(Engine.player, Engine._config.system.maxSaveCount);

    const controller = new SceneController({
      game: this.game,
      scenario: s,
      scriptManager: Engine.scriptManager,
      config: Engine.config,
      player: Engine.player,
      storageKeys
    });
    controller.start();
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
