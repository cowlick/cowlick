"use strict";
import {Script, collectAssetIds} from "./Script";

/**
 * シーンの1フレームを表す。
 */
export class Frame {
  private _scripts: Script[];
  private cacheAssetIds: string[];

  constructor(scripts: Script[]) {
    this._scripts = scripts;
  }

  get scripts(): Script[] {
    return this._scripts;
  }

  get assetIds(): string[] {
    if (!this.cacheAssetIds) {
      this.cacheAssetIds = collectAssetIds(this._scripts);
    }
    return this.cacheAssetIds;
  }
}
