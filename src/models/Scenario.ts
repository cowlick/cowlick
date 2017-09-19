"use strict";
import {Scene} from "./Scene";
import {Frame} from "./Frame";
import {Jump} from "./Script";

export class Scenario {

  private index = 0;
  private scenes: Scene[];

  constructor(scenes: Scene[]) {
    this.scenes = scenes;
  }

  static load(game: g.Game): Scenario {
    return g._require(game, "scenario");
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

  nextFrame() {
    if(this.index < this.scenes.length) {
      return this.scenes[this.index].next();
    } else {
      return undefined;
    }
  }

  update(target: Jump): boolean {
    const i = this.scenes.findIndex(s => s.label === target.label);
    if(i > -1) {
      this.index = i;
      this.scenes[this.index].reset(target.frame);
      return true;
    } else {
      return false;
    }
  }
}
