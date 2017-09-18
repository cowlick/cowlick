"use strict";
import {ScenarioViewModel} from "../vm/ScenarioViewModel";
import {Scenario} from "../models/Scenario";
import {Scene as SceneModel} from "../models/Scene";
import {Frame} from "../models/Frame";
import * as script from "../models/Script";
import {Label} from "./Label";
import {LayerGroup} from "./LayerGroup";
import {Config} from "../Config";
import {ScriptManager} from "../ScriptManager";
import {Tag, Layer} from "../Constant";

export interface SceneParameters {
  game: g.Game;
  scenario: Scenario;
  scriptManager: ScriptManager;
  config: Config;
}

export class Scene extends g.Scene {

  private text: Label;
  private scenario: ScenarioViewModel;
  private scriptManager: ScriptManager;
  private layerGroup: LayerGroup;
  private config: Config;
  private audios: g.AudioAsset[];
  private videos: g.VideoAsset[];

  constructor(params: SceneParameters) {
    super({
      game: params.game,
      assetIds: params.scenario.scene.assetIds.concat([params.config.pane.assetId])
    });

    this.layerGroup = new LayerGroup(this);
    this.scriptManager = params.scriptManager;
    this.config = params.config;
    this.audios = [];
    this.videos = [];

    this.loaded.add(this.onLoaded, this);

    this.scenario = new ScenarioViewModel(params.scenario);
    this.scenario.nextFrame((frame: Frame) => {
      this.applyScripts(frame.scripts);
      this.layerGroup.top(Layer.message);
      this.layerGroup.top(Layer.system);
    });
  }

  get source(): Scenario {
    return this.scenario.source;
  }

  appendE(e: g.E, config: script.LayerConfig) {
    this.layerGroup.appendE(e, config);
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
      layer.pointDown.remove(this.requestNextFrame, layer);
    });
  }

  enableNextFrameTrigger() {
    this.layerGroup.evaluate(Layer.message, (layer) => {
      layer.pointDown.add(this.requestNextFrame, layer);
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

  private onLoaded() {

    const frame = this.scenario.source.frame;

    if(frame) {
      this.removeLayers(frame.scripts);
      this.createWindowLayer();
      this.createSystemLayer();
      this.applyScripts(frame.scripts);
    } else {
      this.createWindowLayer();
      this.createSystemLayer();
    }
    this.layerGroup.top(Layer.message);
    this.layerGroup.top(Layer.system);
  }

  private createWindowLayer() {
    this.scriptManager.call(this, {
      tag: Tag.pane,
      data: this.config.window.message
    });
    this.layerGroup.evaluate(Layer.message, (layer) => {
      this.text = new Label(this, this.config.font);
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
}
