"use strict";
import {Scene} from "./Scene";
import {Frame} from "./Frame";

export class Scenario {

  private index = 0;
  private scenes: Scene[];

  constructor(scenes: Scene[]) {
    this.scenes = scenes;
  }

  static load(): Scenario {
    // TODO: デフォルトのシナリオファイルを読み込む
    return new Scenario([]);
  }

  get scene() {
    if(this.index < this.scenes.length) {
      return this.scenes[this.index];
    } else {
      return undefined;
    }
  }

  get frame() {
    if(this.index < this.scenes.length) {
      return this.scenes[this.index].frame;
    } else {
      return undefined;
    }
  }

  nextScene() {
    if(this.index < this.scenes.length) {
      this.index++;
      return this.scenes[this.index];
    } else {
      return undefined;
    }
  }

  nextFrame() {
    if(this.index < this.scenes.length) {
      return this.scenes[this.index].next();
    } else {
      return undefined;
    }
  }

  update(label: string): boolean {
    const i = this.scenes.findIndex(s => s.label === label);
    if(i > -1) {
      this.index = i;
      return true;
    } else {
      return false;
    }
  }
}
