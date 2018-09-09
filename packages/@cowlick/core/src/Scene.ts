import {Frame} from "./Frame";

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
  frames: Frame[];

  constructor(params: SceneParameters) {
    this._index = 0;
    this._label = params.label;
    this.frames = params.frames;
  }

  get index() {
    return this._index;
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
}
