"use strict";
import {Frame} from "./Frame";

export interface SceneParameters {
  label: string;
  frames: Frame[];
}

export class Scene {

  private index: number = 0;
  private _label: string;
  private frames: Frame[];

  constructor(params: SceneParameters) {
    this._label = params.label;
    this.frames = params.frames;
  }

  get label() {
    return this._label;
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

  reset() {
    this.index = 0;
  }
}
