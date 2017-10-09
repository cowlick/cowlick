"use strict";
import {Script, collectAssetIds} from "./Script";

export class Frame {

  private _scripts: Script<any>[];

  constructor(scripts: Script<any>[]) {
    this._scripts = scripts;
  }

  get scripts(): Script<any>[] {
    return this._scripts;
  }

  get assetIds(): string[] {
    return collectAssetIds(this._scripts);
  }
}
