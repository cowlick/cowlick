"use strict";
import {Scenario} from "./models/Scenario";
import {Scene} from "./components/Scene";
import {Config, defaultConfig} from "./Config";
import {ScriptManager, ScriptFunction} from "./scripts/ScriptManager";
import {defaultSctipts} from "./scripts/defaultScripts";
import {createStorageKeys} from "./GameStateHelper";

export class Engine {

  private game: g.Game;
  private static _scriptManager = new ScriptManager(defaultSctipts);
  private static _config = defaultConfig;
  // 仮置き
  static player: g.Player = { id: "0" };

  constructor(game: g.Game) {
    this.game = game;
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

  start(scenario?: Scenario): void {

    const s = scenario ? scenario : Scenario.load(this.game);

    const storageKeys = createStorageKeys(Engine.player, Engine._config.system.maxSaveCount);

    const scene = new Scene({
      game: this.game,
      scenario: s,
      scriptManager: Engine.scriptManager,
      config: Engine.config,
      player: Engine.player,
      storageKeys
    });
    this.game.pushScene(scene);
  }

  script(name: string, f: ScriptFunction) {
    Engine.scriptManager.register(name, f);
  }
}
