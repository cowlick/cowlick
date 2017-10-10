"use strict";
import {Scenario} from "../models/Scenario";
import {Frame} from "../models/Frame";
import * as script from "../models/Script";
import {ScenarioViewModel} from "../vm/ScenarioViewModel";
import {Scene} from "./Scene";
import {SaveLoadScene} from "./SaveLoadScene";
import {ScriptManager} from "../scripts/ScriptManager";
import {Config} from "../Config";

export interface SceneControllerParameters {
  game: g.Game;
  scenario: Scenario;
  scriptManager: ScriptManager;
  config: Config;
  player: g.Player;
  storageKeys: g.StorageKey[];
}

export class SceneController {

  game: g.Game;
  private player: g.Player;
  private config: Config;
  private scenario: ScenarioViewModel;
  private scriptManager: ScriptManager;

  private _current: Scene;
  private saveLoadScene: SaveLoadScene;

  constructor(params: SceneControllerParameters) {
    this.game = params.game;
    this.scenario = new ScenarioViewModel(params.scenario);
    this.scriptManager = params.scriptManager;
    this.config = params.config;
    this.player = params.player;
    this._current = new Scene({
      game: this.game,
      scenario: this.scenario,
      scriptManager: this.scriptManager,
      config: this.config,
      controller: this,
      player: this.player,
      storageKeys: params.storageKeys
    });
    this.saveLoadScene = new SaveLoadScene({
      game: this.game,
      scene: this.scenario.source.scene,
      config: this.config,
      scriptManager: this.scriptManager,
      assetIds: this.collectSaveDataAssetIds()
    });
  }

  get source(): Scenario {
    return this.scenario.source;
  }

  get current(): Scene {
    return this._current;
  }

  get backlog(): Frame[] {
    return this.scenario.backlog;
  }

  pushScene() {
    this.game.pushScene(this._current);
  }

  jump(target: script.Jump) {
    const previous = this.source.scene.label;
    if(this.source.update(target)) {
      if(previous === this.source.scene.label) {
        if(! this.scenario.load()) {
          this.game.logger.warn("scene not found", target);
        }
      } else {
        this.loadScene();
      }
    } else {
      // TODO: 続行不可能としてタイトルに戻る?
      this.game.logger.warn("scene not found", target);
    }
  }

  openSaveScene() {
    this.game.pushScene(this.saveLoadScene);
  }

  openLoadScene() {
    this.game.pushScene(this.saveLoadScene);
  }

  private loadScene() {
    this.scenario.backlog = [];
    this.scenario.frame.removeAll();
    this._current = new Scene({
      game: this.game,
      scenario: this.scenario,
      scriptManager: this.scriptManager,
      config: this.config,
      controller: this,
      player: this.player,
      state: this._current.gameState
    });
    this.saveLoadScene.destroy();
    this.saveLoadScene = new SaveLoadScene({
      game: this.game,
      scene: this.scenario.source.scene,
      config: this.config,
      scriptManager: this.scriptManager,
      assetIds: this.collectSaveDataAssetIds()
    });
    this.saveLoadScene.prefetch();
    this.game.replaceScene(this._current);
  }

  private collectSaveDataAssetIds(): string[] {
    return [];
  }
}
