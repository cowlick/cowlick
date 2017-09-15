"use strict";
import {Image} from "./Image";

export class Frame {

  private index = -1;
  private _images: Image[];
  private _text: string;

  constructor(images: Image[], text: string) {
    this._images = images;
    this._text = text;
  }

  get images(): Image[] {
    return this._images;
  }

  get assetIds(): string[] {
    return this._images.map(i => i.id);
  }

  get text(): string {
    return this._text;
  }
}
