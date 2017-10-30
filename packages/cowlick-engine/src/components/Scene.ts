"use strict";
import {Storage} from "../models/Storage";
import * as core from "cowlick-core";
import {GameState} from "../models/GameState";
import {ScriptManager} from "../scripts/ScriptManager";
import {Message} from "./Message";
import {LayerGroup} from "./LayerGroup";
import {AudioGroup} from "./AudioGroup";
import {SceneController} from "./SceneController";
import {loadGameState} from "./GameStateHelper";

export interface SceneParameters {
  game: g.Game;
  scenario: core.Scenario;
  scriptManager: ScriptManager;
  config: core.Config;
  controller: SceneController;
  player: g.Player;
  storageKeys?: g.StorageKey[];
  state?: GameState;
}

export class Scene extends g.Scene {

  private _message: Message;
  private scenario: core.Scenario;
  private scriptManager: ScriptManager;
  private layerGroup: LayerGroup;
  private config: core.Config;
  private controller: SceneController;
  private audioGroup: AudioGroup;
  private videos: g.VideoAsset[];
  private storage: Storage;
  private storageKeys: g.StorageKey[];
  private player: g.Player;
  private _gameState: GameState;
  private _enabledWindowClick: boolean;

  constructor(params: SceneParameters) {
    super({
      game: params.game,
      assetIds: Scene.collectAssetIds(params),
      storageKeys: params.state ? undefined : params.storageKeys
    });

    this.layerGroup = new LayerGroup(this);
    this.scriptManager = params.scriptManager;
    this.config = params.config;
    this.controller = params.controller;
    this.audioGroup = new AudioGroup(this.game, params.config.audio);
    this.videos = [];
    this.player = params.player;
    this.storageKeys = params.storageKeys;
    if(params.state) {
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

  appendLayer(e: g.E, config: core.LayerConfig) {
    this.layerGroup.append(e, config);
  }

  removeLayer(name: string) {
    this.layerGroup.remove(name);
  }

  updateText(text: core.Text) {
    this._message.updateText(text);
    this._message.onFinished.addOnce(
      (text) => {
        this.scenario.pushLog({ text, frame: this.scenario.frame });
      },
      this
    );
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
    this.layerGroup.evaluate(core.Layer.message, (layer) => {
      layer.touchable = true;
      if(this._message.finished) {
        layer.pointUp.addOnce(this.requestNextFrame, this);
        for(const c of layer.children) {
          c.pointUp.addOnce(this.requestNextFrame, this);
        }
      } else {
        layer.pointUp.addOnce(this.onWindowClick, this);
        for(const c of layer.children) {
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
    const a = (this.assets[audio.assetId] as g.AudioAsset);
    const player = a.play();
    this.audioGroup.add(audio.group, player);
  }

  changeVolume(data: core.ChangeVolume) {
    this.audioGroup.changeVolume(data.groupName, data.volume);
  }

  stopAudio(audio: core.Audio) {
    this.audioGroup.remove(audio);
  }

  playVideo(video: core.Video) {
    // TODO: 最後まで流し終わったことを検知できるようになったら作り直す
    const v = (this.assets[video.assetId] as g.VideoAsset);
    v.play();
    this.videos.push(v);
  }

  stopVideo(video: core.Video) {
    const i = this.videos.findIndex(asset => asset.id === video.assetId);
    if(i > 0) {
      const v = this.videos[i];
      v.stop();
      v.destroy();
      this.videos.splice(i, 1);
    } else {
      throw new core.GameError("video not found", video);
    }
  }

  save(scene: core.Scene, info: core.Save) {
    this.storage.save(scene, info);
  }

  load(index: number): core.SaveData {
    return this.storage.load(index);
  }

  private onLoaded() {

    const frame = this.scenario.frame;

    if(! this._gameState) {
      this._gameState = loadGameState(this, this.storageKeys, this.config.system.maxSaveCount);
    }
    this.storage = new Storage(this.game.storage, this.player, this._gameState);

    if(frame) {
      this.removeLayers(frame.scripts);
      this.createMessageLayer();
      this.createSystemLayer();
      this.applyScripts(frame.scripts);
    } else {
      this.createMessageLayer();
      this.createSystemLayer();
    }
    this.topMessageLayer();
    this.layerGroup.top(core.Layer.system);
  }

  private disableTrigger() {
    this.layerGroup.evaluate(core.Layer.message, (layer) => {
      layer.touchable = false;
      layer.pointUp.removeAll();
      for(const c of layer.children) {
        c.pointUp.removeAll();
      }
    });
  }

  private loadFrame(frame: core.Frame) {
    if(frame) {
      this.removeLayers(frame.scripts);
      this.applyScripts(frame.scripts);
    }
    this.topMessageLayer();
    this.layerGroup.top(core.Layer.system);
  }

  private topMessageLayer() {
    this.layerGroup.evaluate(core.Layer.message, (layer) => {
      if(layer.touchable) {
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
    this.layerGroup.append(this._message, { name: core.Layer.message });
    this.enableWindowClick();
  }

  private createSystemLayer() {
    for(const s of this.config.window.system) {
      this.scriptManager.call(this.controller, s);
    }
  }

  private removeLayers(scripts: core.Script<any>[]) {
    const names = new Set<string>();
    scripts.forEach(s => {
      if(s.data.layer) {
        names.add(s.data.layer);
      }
    });
    names.forEach(name => {
      this.layerGroup.remove(name);
    });
  }

  private applyScripts(scripts: core.Script<any>[]) {
    scripts.forEach(s => {
      this.scriptManager.call(this.controller, s);
    });
  }

  private static collectAssetIds(params: SceneParameters) {
    const assetIds = params.scenario.scene.assetIds
      .concat(core.collectAssetIds(params.config.window.system));
    if(params.config.window.message.backgroundImage) {
      assetIds.push(params.config.window.message.backgroundImage);
    }
    return assetIds;
  }

  private onWindowClick() {
    if(this._enabledWindowClick) {
      if(this._message.finished) {
        this.requestNextFrame();
      } else {
        this._message.showAll();
        this.enableWindowClick();
      }
    }
  }
}
