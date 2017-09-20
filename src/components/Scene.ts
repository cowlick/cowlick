"use strict";
import {ScenarioViewModel} from "../vm/ScenarioViewModel";
import {StorageViewModel} from "../vm/StorageViewModel";
import {Scenario} from "../models/Scenario";
import {Scene as SceneModel} from "../models/Scene";
import {Frame} from "../models/Frame";
import * as script from "../models/Script";
import {GameState} from "../models/GameState";
import {SaveData} from "../models/SaveData";
import {Label} from "./Label";
import {LayerGroup} from "./LayerGroup";
import {loadGameState} from "../GameStateHelper";
import {Config} from "../Config";
import {ScriptManager} from "../ScriptManager";
import {Tag, Layer} from "../Constant";

export interface SceneParameters {
  game: g.Game;
  scenario: Scenario;
  scriptManager: ScriptManager;
  config: Config;
  player: g.Player;
  storageKeys?: g.StorageKey[];
  state?: GameState;
}

export class Scene extends g.Scene {

  private text: Label;
  private scenario: ScenarioViewModel;
  private scriptManager: ScriptManager;
  private layerGroup: LayerGroup;
  private config: Config;
  private audios: g.AudioAsset[];
  private videos: g.VideoAsset[];
  private storage: StorageViewModel;
  private storageKeys: g.StorageKey[];
  private player: g.Player;
  private _gameState: GameState;

  // 実行時のthisの問題やTrigger.removeできない問題を回避するための措置
  private _requestNextFrame = this.requestNextFrame.bind(this);

  constructor(params: SceneParameters) {
    super({
      game: params.game,
      assetIds: Scene.collectAssetIds(params),
      storageKeys: params.state ? undefined : params.storageKeys
    });

    this.layerGroup = new LayerGroup(this);
    this.scriptManager = params.scriptManager;
    this.config = params.config;
    this.audios = [];
    this.videos = [];
    this.player = params.player;
    this.storageKeys = params.storageKeys;
    if(params.state) {
      this._gameState = params.state;
    }

    this.loaded.add(this.onLoaded, this);

    this.scenario = new ScenarioViewModel(params.scenario);
    this.scenario.nextFrame((frame: Frame) => {
      this.applyScripts(frame.scripts);
      this.topMessageLayer();
      this.layerGroup.top(Layer.system);
    });
  }

  get source(): Scenario {
    return this.scenario.source;
  }

  get gameState(): GameState {
    return this._gameState;
  }

  appendLayer(e: g.E, config: script.LayerConfig) {
    this.layerGroup.append(e, config);
  }

  updateText(text: string) {
    this.text.updateText(text);
  }

  visible(visibility: script.Visibility) {
    this.layerGroup.visible(visibility);
  }

  click() {
    this.pointUpCapture.addOnce(this.requestNextFrame, this);
  }

  disableNextFrameTrigger() {
    this.layerGroup.evaluate(Layer.message, (layer) => {
      layer.touchable = false;
      layer.pointDown.remove(this._requestNextFrame, layer);
      for(const c of layer.children) {
        c.pointDown.remove(this._requestNextFrame, c);
      }
    });
  }

  enableNextFrameTrigger() {
    this.layerGroup.evaluate(Layer.message, (layer) => {
      layer.touchable = true;
      layer.pointDown.add(this._requestNextFrame, layer);
      for(const c of layer.children) {
        c.pointDown.add(this._requestNextFrame, c);
      }
    });
  }

  transition(layer: string, f: (e: g.Pane) => void) {
    this.layerGroup.evaluate(layer, f);
  }

  requestNextFrame() {
    if(! this.scenario.next()) {
      this.game.logger.warn("next frame not found: " + this.scenario.source.scene.label);
    }
  }

  playAudio(audio: script.Audio) {
    const a = (this.assets[audio.assetId] as g.AudioAsset);
    a.play();
    this.audios.push(a);
  }

  stopAudio(audio: script.Audio) {
    const i = this.audios.findIndex(asset => asset.id === audio.assetId);
    if(i > 0) {
      this.audios[i].destroy();
      this.audios.splice(i, 1);
    } else {
      this.game.logger.warn("audio not found: " + audio.assetId);
    }
  }

  playVideo(video: script.Video) {
    // TODO: 最後まで流し終わったことを検知できるようになったら作り直す
    const v = (this.assets[video.assetId] as g.VideoAsset);
    v.play();
    this.videos.push(v);
  }

  stopVideo(video: script.Video) {
    const i = this.audios.findIndex(asset => asset.id === video.assetId);
    if(i > 0) {
      const v = this.videos[i];
      v.stop();
      v.destroy();
      this.videos.splice(i, 1);
    } else {
      this.game.logger.warn("video not found: " + video.assetId);
    }
  }

  save(scene: SceneModel, info: script.Save): string | void {
    return this.storage.save(scene, info);
  }

  load(index: number): SaveData {
    return this.storage.load(index);
  }

  private onLoaded() {

    const frame = this.scenario.source.frame;

    if(! this._gameState) {
      this._gameState = loadGameState(this, this.storageKeys, this.config.system.maxSaveCount);
    }
    this.storage = new StorageViewModel(this.game.storage, this.player, this._gameState);

    if(frame) {
      this.removeLayers(frame.scripts);
      this.createWindowLayer();
      this.createSystemLayer();
      this.applyScripts(frame.scripts);
    } else {
      this.createWindowLayer();
      this.createSystemLayer();
    }
    this.topMessageLayer();
    this.layerGroup.top(Layer.system);
  }

  private topMessageLayer() {
    this.layerGroup.evaluate(Layer.message, (layer) => {
      if(layer.touchable) {
        this.layerGroup.top(Layer.message);
      }
    });
  }

  private createWindowLayer() {
    this.scriptManager.call(this, {
      tag: Tag.pane,
      data: this.config.window.message
    });
    this.layerGroup.evaluate(Layer.message, (layer) => {
      this.text = new Label(this, this.config);
      layer.append(this.text);
    });
    this.enableNextFrameTrigger();
  }

  private createSystemLayer() {
    for(const s of this.config.window.system) {
      this.scriptManager.call(this, s);
    }
  }

  private removeLayers(scripts: script.Script[]) {
    const names = new Set<string>();
    scripts.forEach((s: script.Script) => {
      if(s.data.layer) {
        names.add(s.data.layer);
      }
    });
    names.forEach(name => {
      this.layerGroup.remove(name);
    });
  }

  private applyScripts(scripts: script.Script[]) {
    scripts.forEach(s => {
      this.scriptManager.call(this, s);
    });
  }

  private static collectAssetIds(params: SceneParameters) {
    const assetIds = params.scenario.scene.assetIds
      .concat(script.collectAssetIds(params.config.window.system));
    if(params.config.window.message.backgroundImage) {
      assetIds.push(params.config.window.message.backgroundImage);
    }
    return assetIds;
  }
}
