"use strict";
import {ChoiceItem} from "../models/Script";
import {ButtonParameters, Button} from "./Button";
import {Scene} from "./Scene";

export interface ChoiceButtonParameters extends ButtonParameters {
  choice: ChoiceItem;
}

export class ChoiceButton extends Button {

  choice: ChoiceItem;

  constructor(params: ChoiceButtonParameters) {
    super(params);
    this.choice = params.choice;

    let label = new g.Label({
      scene: this.scene,
      text: this.choice.text,
      font: new g.DynamicFont({
        game: this.scene.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
      }),
      fontSize: 18,
      textColor: params.config.font.color
    });
    label.aligning(this.width, g.TextAlign.Center);
    label.invalidate();
    this.append(label);
  }

  move(x: number, y: number) {

    this.x = x;
    this.y = y;

    this.modified();
  }
}
