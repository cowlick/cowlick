"use strict";
import {Image, Tag, FrameImage} from "@cowlick/core";

interface Frame {
  width: number;
  height: number;
  scale: number;
  frames: number[];
  interval?: number;
}

export function createFrameSprite(scene: g.Scene, src: g.ImageAsset, frame: Frame) {
  const sprite = new g.FrameSprite({
    scene,
    src,
    width: frame.width,
    height: frame.height
  });
  sprite.frames = frame.frames;
  if (frame.interval) {
    sprite.interval = frame.interval;
  }
  sprite.start();
  return sprite;
}

export function createImage(scene: g.Scene, image: Image) {
  const src = scene.assets[image.assetId] as g.ImageAsset;
  let sprite: g.Sprite;
  if (image.tag === Tag.frameImage) {
    sprite = createFrameSprite(scene, src, (image as FrameImage).frame);
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
