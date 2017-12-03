"use strict";
import {Image} from "cowlick-core";
import {Config} from "cowlick-config";
import {Button} from "./Button";
import {Scene} from "./Scene";
import {createFrameSprite, createImage} from "./Image";

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
    if (image.frame) {
      if (typeof image.frame.width === "undefined") {
        image.frame.width = asset.width / 3;
      }
      if (typeof image.frame.height === "undefined") {
        image.frame.height = asset.height;
      }
    }
    return new ImageButton(scene, createFrameSprite(scene, asset, image));
  }
}
