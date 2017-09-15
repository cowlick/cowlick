"use strict";
import {ScenarioViewModel} from "../vm/ScenarioViewModel";
import {Scenario} from "../models/Scenario";
import {Scene as SceneModel} from "../models/Scene";
import {Frame} from "../models/Frame";
import {Script} from "../models/Script";
import {MessageWindow} from "./MessageWindow";

export interface SceneParameters {
  game: g.Game;
  scenario: Scenario;
  scripts: Map<string, any>;
}

export class Scene extends g.Scene {

  messageWindow: MessageWindow;
  scenario: ScenarioViewModel;
  scripts: Map<string, any>;
  images: g.Sprite[] = [];

  constructor(params: SceneParameters) {
    super({
      game: params.game,
      assetIds: params.scenario.scene.assetIds
    });

    this.scripts = params.scripts;

    this.loaded.handle(this, this.onLoaded);

    this.scenario = new ScenarioViewModel(params.scenario);
    this.scenario.nextScene((scene: SceneModel) => {
    });
    this.scenario.nextFrame((frame: Frame) => {
      this.applyScripts(frame.scripts);
      this.messageWindow.updateText(frame.text);
      this.append(this.messageWindow);
    });
  }

  onLoaded() {

    const frame = this.scenario.source.frame;

    this.messageWindow = new MessageWindow(this);
    this.messageWindow.touchable = true;
    this.messageWindow.pointDown.add(this.onPointDown, this);

    if(frame) {
      this.applyScripts(frame.scripts);
      this.messageWindow.updateText(frame.text);
    }

    this.append(this.messageWindow);
  }

  onPointDown() {
    this.scenario.next();
  }

  appendImage(sprite: g.Sprite) {
    this.append(sprite);
    this.images.push(sprite);
  }

  private applyScripts(scripts: Script[]) {
    if(scripts.length > 0) {
      this.images.forEach(s => {
        this.remove(s);
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
