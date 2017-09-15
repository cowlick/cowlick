"use strict";
import {Label} from "./Label";

export class MessageWindow extends g.Pane {

  textLabel: Label;

  constructor(scene: g.Scene) {
    super({
      scene,
      width: scene.game.width,
      height: scene.game.height / 4,
      x: 0,
      y: scene.game.height - scene.game.height / 4,
    });


    this.textLabel = new Label(scene);
    this.append(this.textLabel);
  }

  updateText(text: string) {
    this.textLabel.updateText(text);
  }
}
