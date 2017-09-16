"use strict";
import {Script} from "./Script";

export class Frame {

  private index = -1;
  private _scripts: Script[];

  constructor(scripts: Script[]) {
    this._scripts = scripts;
  }

  get scripts(): Script[] {
    return this._scripts;
  }

  get assetIds(): string[] {
    let ids: string[] = [];
    this._scripts.forEach(s => {
      if(typeof(s.data) === "object" && s.data.assetId) {
        ids.push(<string>s.data.assetId);
      }
    });
    return ids;
  }
}
