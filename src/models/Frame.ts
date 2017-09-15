"use strict";
import {Script} from "./Script";

export class Frame {

  private index = -1;
  private _scripts: Script[];
  private _text: string;

  constructor(scripts: Script[], text?: string) {
    this._scripts = scripts;
    this._text = text;
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

  get text(): string {
    return this._text;
  }
}
