"use strict";
import {Storage} from "../models/Storage";
import * as core from "cowlick-core";
import {Config} from "cowlick-config";
import {GameState} from "../models/GameState";
import {Snapshot} from "../models/Snapshot";
import {ScriptManager} from "../scripts/ScriptManager";
import {Message} from "./Message";
import {LayerGroup} from "./LayerGroup";
import {AudioGroup} from "./AudioGroup";
import {VideoGroup} from "./VideoGroup";
import {Scene} from "./Scene";
import {SceneController} from "./SceneController";
import {loadGameState} from "./GameStateHelper";
import {AutoMode} from "./AutoMode";

export interface GameSceneParameters {
  game: g.Game;
  scenario: core.Scenario;
  scriptManager: ScriptManager;
  config: Config;
  controller: SceneController;
  player: g.Player;
  storageKeys?: g.StorageKey[];
  state?: GameState;
  storageValuesSerialization?: g.StorageValueStoreSerialization;
}

export class GameScene extends Scene {
  private _message: Message;
  private scenario: core.Scenario;
  private scriptManager: ScriptManager;
  private layerGroup: LayerGroup;
  private config: Config;
  private controller: SceneController;
  private audioGroup: AudioGroup;
  private videoGroup: VideoGroup;
  private storage: Storage;
  private storageKeys: g.StorageKey[];
  private player: g.Player;
  private _gameState: GameState;
  private _enabledWindowClick: boolean;
  private autoMode: AutoMode;

  constructor(params: GameSceneParameters) {
    super({
      game: params.game,
      assetIds: GameScene.collectAssetIds(params),
      storageKeys: params.storageKeys,
      storageValuesSerialization: params.storageValuesSerialization
    });

    this.layerGroup = new LayerGroup(this);
    this.scriptManager = params.scriptManager;
    this.config = params.config;
    this.controller = params.controller;
    this.audioGroup = new AudioGroup(this, params.config.audio);
    this.videoGroup = new VideoGroup(this);
    this.player = params.player;
    this.storageKeys = params.storageKeys;
    if (params.state) {
      this._gameState = params.state;
    }

    this.loaded.add(this.onLoaded, this);

    this.scenario = params.scenario;
    this.scenario.onLoaded.add(this.loadFrame, this);
  }

  get source(): core.Scene {
    return this.scenario.scene;
  }

  get gameState(): GameState {
    return this._gameState;
  }

  get enabledWindowClick(): boolean {
    return this._enabledWindowClick;
  }

  snapshot(): Snapshot {
    return {
      ...this.gameState.createSnapshot(),
      storageKeys: this.storageKeys,
      storageValuesSerialization: this.serializeStorageValues()
    };
  }

  appendLayer(e: g.E, config: core.LayerConfig) {
    this.layerGroup.append(e, config);
  }

  removeLayer(name: string) {
    this.layerGroup.remove(name);
  }

  updateText(text: core.Text) {
    const scene = this.scenario.scene;
    this._message.updateText(text, this._gameState.isAlreadyRead(scene.label, scene.index));
    this._gameState.markAlreadyRead(scene.label, scene.index);
    this._message.onFinished.addOnce(t => {
      this.scenario.pushTextLog(t);
      this.scriptManager.call(this.controller, {tag: core.Tag.autoMode, data: {}});
    }, this);
    this.disableWindowClick();
    this.enableWindowClick();
  }

  applyLayerConfig(config: core.LayerConfig) {
    this.layerGroup.applyConfig(config);
  }

  disableWindowClick() {
    this.disableTrigger();
    this._enabledWindowClick = false;
  }

  enableWindowClick() {
    this.layerGroup.evaluate(core.Layer.message, layer => {
      layer.touchable = true;
      if (this._message.finished) {
        layer.pointUp.addOnce(this.requestNextFrame, this);
        for (const c of layer.children) {
          c.pointUp.addOnce(this.requestNextFrame, this);
        }
      } else {
        layer.pointUp.addOnce(this.onWindowClick, this);
        for (const c of layer.children) {
          c.pointUp.addOnce(this.onWindowClick, this);
        }
      }
    });
    this._enabledWindowClick = true;
  }

  transition(layer: string, f: (e: g.E) => void) {
    this.layerGroup.evaluate(layer, f);
  }

  requestNextFrame() {
    // 連打対策
    this.disableWindowClick();

    this.scenario.next();
  }

  playAudio(audio: core.Audio) {
    const player = this.audioGroup.add(audio);
    if (audio.group === core.AudioGroup.voice) {
      player.stopped.addOnce(() => {
        this.scriptManager.call(this.controller, {tag: core.Tag.autoMode, data: {}});
      }, this);
    }
  }

  changeVolume(data: core.ChangeVolume) {
    this.audioGroup.changeVolume(data.groupName, data.volume);
  }

  stopAudio(audio: core.Audio) {
    this.audioGroup.remove(audio);
  }

  playVideo(video: core.Video) {
    this.videoGroup.add(video);
  }

  stopVideo(video: core.Video) {
    this.videoGroup.remove(video);
  }

  save(info: core.Save) {
    this.storage.save(info);
  }

  load(index: number): core.SaveData {
    return this.storage.load(index);
  }

  setAutoTrigger() {
    this.autoMode.setTrigger();
  }

  applyMessageSpeed() {
    this._message.applySpeed();
  }

  applyFontSetting() {
    this._message.applyFontSetting();
  }

  private onLoaded() {
    this.autoMode = new AutoMode(this);

    if (!this._gameState) {
      this._gameState = loadGameState(this, this.storageKeys, this.config, this.scenario);
    }
    this._gameState.copyGameVariables();
    this.storage = new Storage({
      storage: this.game.storage,
      player: this.player,
      state: this._gameState
    });
    // ゲーム中にそこそこの頻度で実行されるタイミング、という点からここで保存している
    this.storage.saveBuiltinVariables();
    this.storage.saveSystemVariables();

    this.createMessageLayer();
    this.createSystemLayer();

    this.scenario.load();
  }

  private disableTrigger() {
    this.autoMode.clear();
    this.layerGroup.evaluate(core.Layer.message, layer => {
      layer.touchable = false;
      layer.pointUp.removeAll();
      for (const c of layer.children) {
        c.pointUp.removeAll();
      }
    });
  }

  private loadFrame(frame: core.Frame) {
    if (frame) {
      this.removeLayers(frame.scripts);
      this.applyScripts(frame.scripts);
    }
    this.topMessageLayer();
    this.layerGroup.top(core.Layer.system);
  }

  private topMessageLayer() {
    this.layerGroup.evaluate(core.Layer.message, layer => {
      if (layer.touchable) {
        this.layerGroup.top(core.Layer.message);
      }
    });
  }

  private createMessageLayer() {
    this.scriptManager.call(this.controller, {
      tag: core.Tag.pane,
      data: this.config.window.message
    });
    this._message = new Message({
      scene: this,
      config: this.config,
      width: this.game.width - 40,
      x: this.config.window.message.layer.x + 20,
      y: this.config.window.message.layer.y + 20,
      gameState: this.gameState
    });
    this.layerGroup.append(this._message, {name: core.Layer.message});
    this.enableWindowClick();
  }

  private createSystemLayer() {
    for (const s of this.config.window.system) {
      this.scriptManager.call(this.controller, s);
    }
  }

  private removeLayers(scripts: core.Script<any>[]) {
    const names = new Set<string>();
    for (const s of scripts) {
      if (s.data.layer) {
        names.add(s.data.layer);
      }
    }
    names.forEach(name => {
      this.layerGroup.remove(name);
    });
  }

  private applyScripts(scripts: core.Script<any>[]) {
    for (const s of scripts) {
      this.scriptManager.call(this.controller, s);
    }
  }

  private static collectAssetIds(params: GameSceneParameters) {
    const assetIds = params.scenario.scene.assetIds.concat(core.collectAssetIds(params.config.window.system));
    if (params.config.window.message.backgroundImage) {
      assetIds.push(params.config.window.message.backgroundImage);
    }
    return assetIds;
  }

  private onWindowClick() {
    if (this._enabledWindowClick) {
      this.gameState.setValue(
        {
          type: core.VariableType.builtin,
          name: core.BuiltinVariable.autoMode
        },
        false
      );

      if (this._message.finished) {
        this.requestNextFrame();
      } else {
        this._message.showAll();
        this.enableWindowClick();
      }
    }
  }
}
