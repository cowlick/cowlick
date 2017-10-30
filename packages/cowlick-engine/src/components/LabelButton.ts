"use strict";
import {ButtonParameters, Button} from "./Button";
import {Scene} from "./Scene";
import {GameState} from "../models/GameState";
import {BuiltinVariable, VariableType, Config} from "cowlick-core";

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
      type: VariableType.system,
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
}
