"use strict";
import {ScenarioViewModel} from "../vm/ScenarioViewModel";
import {Scenario} from "../models/Scenario";
import {Scene as SceneModel} from "../models/Scene";
import {Frame} from "../models/Frame";
import {Script} from "../models/Script";
import {MessageWindow} from "./MessageWindow";
import {LayerGroup} from "./LayerGroup";
import {Config} from "../Config";

export interface SceneParameters {
  game: g.Game;
  scenario: Scenario;
  scripts: Map<string, any>;
  config: Config;
}

export class Scene extends g.Scene {

  private messageWindow: MessageWindow;
  private scenario: ScenarioViewModel;
  scripts: Map<string, any>;
  private layerGroup: LayerGroup;
  private config: Config;

  constructor(params: SceneParameters) {
    super({
      game: params.game,
      assetIds: params.scenario.scene.assetIds.concat([params.config.pane.assetId])
    });

    this.layerGroup = new LayerGroup(this);
    this.scripts = params.scripts;
    this.config = params.config;

    this.loaded.add(this.onLoaded, this);

    this.scenario = new ScenarioViewModel(params.scenario);
    this.scenario.nextScene((scene: SceneModel) => {
    });
    this.scenario.nextFrame((frame: Frame) => {
      this.applyScripts(frame.scripts);
      if(frame.text) {
        this.messageWindow.updateText(frame.text);
      }
      this.append(this.messageWindow);
    });
  }

  get source(): Scenario {
    return this.scenario.source;
  }

  appendE(layerName: string, e: g.E) {
    this.layerGroup.appendE(layerName, e);
  }

  disableMessageWindowTrigger() {
    this.messageWindow.pointDown.remove(this.onMessageWindowPointDown, this);
  }

  private onLoaded() {

    const frame = this.scenario.source.frame;

    this.messageWindow = new MessageWindow(this, this.config);
    this.messageWindow.touchable = true;
    this.messageWindow.pointDown.add(this.onMessageWindowPointDown, this);

    if(frame) {
      this.applyScripts(frame.scripts);
      if(frame.text) {
        this.messageWindow.updateText(frame.text);
      }
    }

    this.append(this.messageWindow);
  }

  private onMessageWindowPointDown() {
    this.scenario.next();
  }

  private applyScripts(scripts: Script[]) {
    if(scripts.length > 0) {
      const names = new Set<string>();
      scripts.forEach((s: Script) => {
        if(s.data.layer) {
          names.add(s.data.layer);
        }
      });
      names.forEach(name => {
        this.layerGroup.remove(name);
      });
      scripts.forEach(s => {
        let f = this.scripts.get(s.tag);
        if(f) {
          f(this, s.data);
        }
      });
    }
  }
}
