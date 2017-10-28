"use strict";
import {ButtonParameters, Button} from "./Button";
import {Scene} from "./Scene";
import {Config} from "../Config";

export interface LabelButtonParameters extends ButtonParameters {
  text: string;
  fontSize?: number;
  config: Config;
}

export class LabelButton extends Button {

  constructor(params: LabelButtonParameters) {
    super(params);

    const font = params.config.font.list[params.config.font.selected];
    const label = new g.Label({
      scene: this.scene,
      text: params.text,
      font,
      fontSize: params.fontSize ? params.fontSize : font.size,
      textColor: params.config.font.color
    });
    label.aligning(this.width, g.TextAlign.Center);
    label.invalidate();
    this.append(label);
  }
}
