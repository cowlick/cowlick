"use strict";
import {ButtonParameters, Button} from "./Button";
import {Scene} from "./Scene";
import {GameState} from "../models/GameState";
import {BuiltinVariable, VariableType} from "cowlick-core";
import {Config} from "cowlick-config";

export interface LabelButtonParameters extends ButtonParameters {
  text: string;
  fontSize?: number;
  config: Config;
  gameState: GameState;
}

export class LabelButton extends Button {
  constructor(params: LabelButtonParameters) {
    super(params);

    const selected = params.gameState.getValue({
      type: VariableType.builtin,
      name: BuiltinVariable.selectedFont
    });
    const font = params.config.font.list[selected];
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

  push() {
    this.y += 2;
    this.height -= 2;
    super.push();
  }

  unpush() {
    this.y -= 2;
    this.height += 2;
    super.unpush();
  }
}
