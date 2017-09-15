"use strict";
import {Frame} from "./Frame";

export class Scene {

  private index: number = 0;
  private frames: Frame[];

  constructor(frames: Frame[]) {
    this.frames = frames;
  }

  get frame() {
    if(this.index < this.frames.length) {
      return this.frames[this.index];
    } else {
      return undefined;
    }
  }

  get assetIds(): string[] {
    let ids: string[] = [];
    this.frames.forEach(f => {
      ids = ids.concat(f.assetIds);
    });
    return ids;
  }

  next() {
    if(this.index < this.frames.length) {
      this.index++;
      return this.frames[this.index];
    } else {
      return undefined;
    }
  }
}
