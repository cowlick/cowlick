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
    this.index++;
    return this.texts[this.index];
  }
}
