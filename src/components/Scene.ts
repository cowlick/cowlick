"use strict";
import {ScenarioViewModel} from "../vm/ScenarioViewModel";
import {Scenario} from "../models/Scenario";
import {Scene as SceneModel} from "../models/Scene";
import {Frame} from "../models/Frame";
import {Script, Visibility} from "../models/Script";
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

  constructor(params: SceneParameters) {
    super({
      game: params.game,
      assetIds: params.scenario.scene.assetIds.concat([params.config.pane.assetId])
    });

    this.layerGroup = new LayerGroup(this);
    this.scriptManager = params.scriptManager;
    this.config = params.config;

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

  appendE(layerName: string, e: g.E) {
    this.layerGroup.appendE(layerName, e);
  }

  updateText(text: string) {
    this.messageWindow.updateText(text);
  }

  visible(visibility: Visibility) {
    this.layerGroup.visible(visibility);
  }

  disableMessageWindowTrigger() {
    this.messageWindow.pointDown.remove(this.onMessageWindowPointDown, this);
  }

  enableMessageWindowTrigger() {
    this.messageWindow.pointDown.add(this.onMessageWindowPointDown, this);
  }

  private onLoaded() {

    const frame = this.scenario.source.frame;

    this.messageWindow = new MessageWindow(this, this.config);
    this.messageWindow.touchable = true;
    this.enableMessageWindowTrigger();

    if(frame) {
      this.removeLayers(frame.scripts);
      this.layerGroup.appendE(Layer.system, this.messageWindow);
      this.applyScripts(frame.scripts);
    } else {
      this.layerGroup.appendE(Layer.system, this.messageWindow);
    }
    if(this.messageWindow.visible()) {
      this.layerGroup.top(Layer.system);
    }
  }

  private onMessageWindowPointDown() {
    if(! this.scenario.next()) {
      this.game.logger.warn("next frame not found: " + this.scenario.source.scene.label);
    }
  }

  private removeLayers(scripts: Script[]) {
    const names = new Set<string>();
    scripts.forEach((s: Script) => {
      if(s.data.layer) {
        names.add(s.data.layer);
      }
    });
    names.forEach(name => {
      this.layerGroup.remove(name);
    });
  }

  private applyScripts(scripts: Script[]) {
    scripts.forEach(s => {
      this.scriptManager.call(this, s);
    });
  }
}
