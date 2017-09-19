"use strict";
import {ChoiceItem} from "../models/Script";
import {ButtonParameters, Button} from "./Button";
import {Scene} from "./Scene";
import {Config} from "../Config";

export interface ChoiceButtonParameters extends ButtonParameters {
  text: string;
  config: Config;
}

export class LabelButton extends Button {

  constructor(params: ChoiceButtonParameters) {
    super(params);

    let label = new g.Label({
      scene: this.scene,
      text: params.text,
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
}
