"use strict";
import {ScenarioViewModel} from "../vm/ScenarioViewModel";
import {Scenario} from "../models/Scenario";
import {Scene as SceneModel} from "../models/Scene";
import {Frame} from "../models/Frame";
import * as script from "../models/Script";
import {MessageWindow} from "./MessageWindow";
import {LayerGroup} from "./LayerGroup";
import {Config} from "../Config";
import {ScriptManager} from "../ScriptManager";
import {Layer} from "../Constant";

export interface SceneParameters {
  game: g.Game;
  scenario: Scenario;
  scriptManager: ScriptManager;
  config: Config;
}

export class Scene extends g.Scene {

  private messageWindow: MessageWindow;
  private scenario: ScenarioViewModel;
  private scriptManager: ScriptManager;
  private layerGroup: LayerGroup;
  private config: Config;
  private audios: g.AudioAsset[];

  constructor(params: SceneParameters) {
    super({
      game: params.game,
      assetIds: params.scenario.scene.assetIds.concat([params.config.pane.assetId])
    });

    this.layerGroup = new LayerGroup(this);
    this.scriptManager = params.scriptManager;
    this.config = params.config;
    this.audios = [];

    this.loaded.add(this.onLoaded, this);

    this.scenario = new ScenarioViewModel(params.scenario);
    this.scenario.nextFrame((frame: Frame) => {
      this.applyScripts(frame.scripts);
      if(this.messageWindow.visible()) {
        this.layerGroup.top(Layer.system);
      }
    });
  }

  get source(): Scenario {
    return this.scenario.source;
  }

  appendE(e: g.E, config: script.LayerConfig) {
    this.layerGroup.appendE(e, config);
  }

  updateText(text: string) {
    this.messageWindow.updateText(text);
  }

  visible(visibility: script.Visibility) {
    this.layerGroup.visible(visibility);
  }

  disableMessageWindowTrigger() {
    this.messageWindow.pointDown.remove(this.requestNextFrame, this);
  }

  enableMessageWindowTrigger() {
    this.messageWindow.pointDown.add(this.requestNextFrame, this);
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

  private onLoaded() {

    const frame = this.scenario.source.frame;

    this.messageWindow = new MessageWindow(this, this.config);
    this.messageWindow.touchable = true;
    this.enableMessageWindowTrigger();

    if(frame) {
      this.removeLayers(frame.scripts);
      this.layerGroup.appendE(this.messageWindow, { name: Layer.system });
      this.applyScripts(frame.scripts);
    } else {
      this.layerGroup.appendE(this.messageWindow, { name: Layer.system });
    }
    if(this.messageWindow.visible()) {
      this.layerGroup.top(Layer.system);
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
