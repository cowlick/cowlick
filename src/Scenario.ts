"use strict";

export class Scenario {

  private index = -1;
  private texts: string[];

  constructor(texts: string[]) {
    this.texts = texts;
  }

  static load(): Scenario {
    // TODO: デフォルトのシナリオファイルを読み込む
    return new Scenario([]);
  }

  next(): string {
    if(this.index < this.texts.length) {
      this.index++;
      return this.texts[this.index];
    } else {
      return undefined;
    }
  }
}
