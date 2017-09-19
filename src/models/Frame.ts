"use strict";
import {Script, collectAssetIds} from "./Script";

export class Frame {

  private _scripts: Script[];

  constructor(scripts: Script[]) {
    this._scripts = scripts;
  }

  get scripts(): Script[] {
    return this._scripts;
  }

  get assetIds(): string[] {
    return collectAssetIds(this._scripts);
  }
}
