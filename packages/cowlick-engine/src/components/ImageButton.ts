"use strict";
import {Image} from "cowlick-core";
import {Button} from "./Button";
import {createFrameSprite} from "./Image";

export class ImageButton extends Button {
  private image: g.FrameSprite;

  constructor(scene: g.Scene, image: g.FrameSprite) {
    super({
      scene,
      width: image.width,
      height: image.height
    });

    this.image = image;
    this.append(image);
  }

  push() {
    this.image.frameNumber = 1;
    super.push();
  }

  unpush() {
    this.image.frameNumber = 0;
    super.unpush();
  }

  static create(scene: g.Scene, image: Image): Button {
    const asset = scene.assets[image.assetId] as g.ImageAsset;
    return new ImageButton(scene, createFrameSprite(scene, asset, image));
  }
}
