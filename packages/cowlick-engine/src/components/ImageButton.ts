"use strict";
import {Button as ButtonConfig, Config} from "cowlick-core";
import {Button} from "./Button";
import {Scene} from "./Scene";
import {createImage} from "./Image";

export class ImageButton extends Button {

  constructor(scene: g.Scene, image: g.Sprite) {
    super({
      scene,
      width: image.width,
      height: image.height
    });

    this.append(image);
  }

  static create(scene: g.Scene, data: ButtonConfig): Button {
    return new ImageButton(scene, createImage(scene, data));
  }
}
