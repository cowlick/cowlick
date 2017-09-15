"use strict";
import {Frame} from "./Frame";

export interface SceneParameters {
  id: string;
  frames: Frame[];
}

export class Scene {

  private index: number = 0;
  private _id: string;
  private frames: Frame[];

  constructor(params: SceneParameters) {
    this._id = params.id;
    this.frames = params.frames;
  }

  get id() {
    return this._id;
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
