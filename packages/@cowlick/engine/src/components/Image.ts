"use strict";
import {Image} from "@cowlick/core";

export function createFrameSprite(scene: g.Scene, src: g.ImageAsset, image: Image) {
  const sprite = new g.FrameSprite({
    scene,
    src,
    width: image.frame.width,
    height: image.frame.height
  });
  sprite.frames = image.frame.frames;
  if ("interval" in image.frame) {
    sprite.interval = image.frame.interval;
  }
  sprite.start();
  return sprite;
}

export function createImage(scene: g.Scene, image: Image) {
  const src = scene.assets[image.assetId] as g.ImageAsset;
  let sprite: g.Sprite;
  if (image.frame) {
    sprite = createFrameSprite(scene, src, image);
  } else {
    sprite = new g.Sprite({
      scene,
      src
    });
  }
  if (image.layer.x !== undefined) {
    sprite.x = image.layer.x;
  }
  if (image.layer.y !== undefined) {
    sprite.y = image.layer.y;
  }
  sprite.invalidate();
  return sprite;
}
