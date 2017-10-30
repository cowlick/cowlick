"use strict";
import {Script, collectAssetIds} from "./Script";

/**
 * シーンの1フレームを表す。
 */
export class Frame {

  private _scripts: Script<any>[];
  private cacheAssetIds: string[];

  constructor(scripts: Script<any>[]) {
    this._scripts = scripts;
  }

  get scripts(): Script<any>[] {
    return this._scripts;
  }

  get assetIds(): string[] {
    if(! this.cacheAssetIds) {
      this.cacheAssetIds = collectAssetIds(this._scripts);
    }
    return this.cacheAssetIds;
  }
}
