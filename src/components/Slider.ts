"use strict";
import * as scrollable from "@xnv/akashic-scrollable";
import * as script from "../models/Script";
import {GameError} from "../models/GameError";
import {GameState} from "../models/GameState";

export interface SliderParameters extends g.PaneParameterObject {
  data: script.Slider;
  state: GameState;
}

export class Slider extends g.Pane {

  private bar: scrollable.Scrollbar;
  private length: number;
  private target: script.Variable;
  private gameState: GameState;
  private maxValue: number;
  private defaultValue: number;

  constructor(params: SliderParameters) {
    super(params);

    this.touchable = true;
    this.length = params.data.length;
    this.target = params.data.target;
    this.gameState = params.state;
    this.maxValue = params.data.max;
    this.defaultValue = params.data.default;

    let bgImage = scrollable.createDefaultScrollbarImage(params.scene.game, 7, "rgba(255, 255, 255, 0.2)", 4, "rgba(218, 218, 218, 0.5)");
    let image = scrollable.createDefaultScrollbarImage(params.scene.game, 7, "rgba(255, 255, 255, 0.5)", 4, "rgba(164, 164, 164, 0.7)");
    switch(params.data.direction) {
      case script.Direction.Vertical:
        this.bar = new scrollable.NinePatchVerticalScrollbar({
          scene: params.scene,
          bgImage,
          image
        });
        break;
      case script.Direction.Horizontal:
        this.bar = new scrollable.NinePatchHorizontalScrollbar({
          scene: params.scene,
          bgImage,
          image
        });
        break;
    }
    this.width = this.bar.width;
    this.height = this.bar.height;

    const value = this.gameState.getValue(this.target);
    if(typeof value === "number") {
      this.setPosRate(value / this.maxValue);
    } else if(typeof value === "undefined") {
      this.setPosRate(this.defaultValue / this.maxValue);
    } else {
      throw new GameError("target variable is not number type", params.data);
    }
    this.bar.onChangeBarPositionRate.add(
      (rate) => {
        this.gameState.setValue(this.target, this.maxValue * rate);
      },
      this
    );
    
    this.append(this.bar);
  }

  reset() {
    this.setPosRate(this.defaultValue / this.maxValue);
  }

  private setPosRate(posRate: number) {
    this.bar.setBarProperties(posRate, this.length * this.length, this.length);
  }
}