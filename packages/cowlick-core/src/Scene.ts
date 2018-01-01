"use strict";
import {Frame} from "./Frame";
import {SaveData} from "./SaveData";
import {Index} from "./Log";

export interface SceneParameters {
  label: string;
  frames: Frame[];
}

/**
 * シーンデータ。
 */
export class Scene {
  private _index: number;
  private _label: string;
  private frames: Frame[];
  private cacheAssetIds: string[];

  constructor(params: SceneParameters) {
    this._index = 0;
    this._label = params.label;
    this.frames = params.frames;
  }

  get index(): Index {
    return {
      label: this.label,
      frame: this._index
    };
  }

  get label() {
    return this._label;
  }

  get frame() {
    if (this._index < this.frames.length) {
      return this.frames[this._index];
    } else {
      return undefined;
    }
  }

  get assetIds(): string[] {
    if (!this.cacheAssetIds) {
      this.cacheAssetIds = [];
      for (const f of this.frames) {
        this.cacheAssetIds = this.cacheAssetIds.concat(f.assetIds);
      }
    }
    return this.cacheAssetIds;
  }

  /**
   * 次のフレームに遷移する。
   */
  next() {
    if (this._index < this.frames.length) {
      this._index++;
    }
  }

  /**
   * フレームインデックスを再設定する。
   *
   * @param index
   */
  reset(index?: number) {
    this._index = index ? index : 0;
  }

  /**
   * セーブデータを作成する。
   *
   * @param variables
   * @param description
   */
  createSaveData(variables: any, description?: string): SaveData {
    const result: SaveData = {
      label: this._label,
      frame: this._index,
      variables
    };
    if (description) {
      result.description = description;
    }
    return result;
  }
}
