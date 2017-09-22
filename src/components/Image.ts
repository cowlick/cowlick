"use strict";
import {Image} from "../models/Script";

export function createImage(scene: g.Scene, image: Image) {
  const asset = scene.assets[image.assetId] as g.ImageAsset;
  let sprite: g.Sprite;
  if(image.frame) {
    let s = new g.FrameSprite({
      scene,
      src: asset,
      width: image.frame.width,
      height: image.frame.height
    });
    s.frames = image.frame.frames;
    s.interval = 1000;
    s.start();
    sprite = s;
  } else {
    sprite = new g.Sprite({
      scene,
      src: asset
    });
  }
  if(image.x !== undefined) {
    sprite.x = image.x;
  }
  if(image.y !== undefined) {
    sprite.y = image.y;
  }
  sprite.invalidate();
  return sprite;
}
