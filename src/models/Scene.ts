"use strict";
import {Frame} from "./Frame";
import {SaveData} from "./SaveData";

export interface SceneParameters {
  label: string;
  frames: Frame[];
}

export class Scene {

  private index: number = 0;
  private _label: string;
  private frames: Frame[];
  private cacheAssetIds: string[];

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
    if(! this.cacheAssetIds) {
      this.cacheAssetIds = [];
      for(const f of this.frames) {
        this.cacheAssetIds = this.cacheAssetIds.concat(f.assetIds);
      }
    }
    return this.cacheAssetIds;
  }

  next() {
    if(this.index < this.frames.length) {
      this.index++;
      return this.frames[this.index];
    } else {
      return undefined;
    }
  }

  reset(index?: number) {
    this.index = index ? index : 0;
  }

  createSaveData(variables: any, description?: string): SaveData {
    const result: SaveData = {
      label: this._label,
      frame: this.index,
      variables
    };
    if(description) {
      result.description = description;
    }
    return result;
  }
}
