"use strict";
import {ScenarioViewModel} from "../vm/ScenarioViewModel";
import {Scenario} from "../models/Scenario";
import {Scene as SceneModel} from "../models/Scene";
import {Frame} from "../models/Frame";
import {Image} from "../models/Image";
import {MessageWindow} from "./MessageWindow";

export class Scene extends g.Scene {

  messageWindow: MessageWindow;
  scenario: ScenarioViewModel;
  images: g.Sprite[] = [];

  constructor(game: g.Game, scenario: Scenario) {
    super({
      game,
      assetIds: scenario.scene.assetIds
    });

    this.loaded.handle(this, this.onLoaded);

    this.scenario = new ScenarioViewModel(scenario);
    this.scenario.nextScene((scene: SceneModel) => {
    });
    this.scenario.nextFrame((frame: Frame) => {
      this.updateImages(frame.images);
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
      this.updateImages(frame.images);
      this.messageWindow.updateText(frame.text);
    }

    this.append(this.messageWindow);
  }

  onPointDown() {
    this.scenario.next();
  }

  private updateImages(images: Image[]) {
    if(images.length > 0) {
      this.images.forEach(s => {
        this.remove(s);
      });
      this.images = images.map(i => {
        const s = this.createImage(i);
        this.append(s);
        return s;
      });
    }
  }

  private createImage(image: Image): g.Sprite {
    const asset = <g.ImageAsset>this.assets[image.id];
    let sprite: g.Sprite;
    if(image.frames) {
      let s = new g.FrameSprite({
        scene: this,
        src: asset,
        width: image.width,
        height: image.height
      });
      s.frames = image.frames;
      s.interval = 1000;
      s.start();
      sprite = s;
    } else {
      sprite = new g.Sprite({
        scene: this,
        src: asset
      });
    }
    if(image.x) {
      sprite.x = image.x;
    }
    if(image.y) {
      sprite.y = image.y;
    }
    sprite.invalidate();
    return sprite;
}
}
