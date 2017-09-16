"use strict";
import {Label} from "./Label";
import {Config} from "../Config";

export class MessageWindow extends g.Pane {

  private textLabel: Label;

  constructor(scene: g.Scene, config: Config) {
    super({
      scene,
      width: scene.game.width - 20,
      height: scene.game.height / 4,
      x: 10,
      y: scene.game.height - scene.game.height / 4 - 40,
      backgroundImage: <g.ImageAsset>scene.assets[config.pane.assetId],
      padding: 4,
      backgroundEffector: new g.NinePatchSurfaceEffector(scene.game, config.pane.borderWidth)
    });


    this.textLabel = new Label(scene, config.font);
    this.append(this.textLabel);
  }

  updateText(text: string) {
    this.textLabel.updateText(text);
  }
}
