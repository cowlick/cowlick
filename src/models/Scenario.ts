"use strict";
import {Scene} from "./Scene";
import {Frame} from "./Frame";
import {Jump} from "./Script";
import {SaveData} from "./SaveData";

export class Scenario {

  private index = 0;
  private scenes: Scene[];
  trigger: g.Trigger<Frame>;
  backlog: Frame[];

  constructor(scenes: Scene[]) {
    this.scenes = scenes;
    this.trigger = new g.Trigger<Frame>();
    this.backlog = [];
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

  load(frame?: Frame): boolean {
    const f = frame ? frame : this.frame;
    if(f) {
      this.trigger.fire(f);
      return true;
    } else {
      return false;
    }
  }

  next(): boolean {
    const previous = this.frame;
    if(this.load(this.nextFrame())) {
      this.backlog.push(previous);
      return true;
    } else {
      return false;
    }
  }

  findScene(data: SaveData): Scene {
    return this.scenes.find(s => s.label === data.label);
  }

  private nextFrame() {
    if(this.index < this.scenes.length) {
      return this.scenes[this.index].next();
    } else {
      return undefined;
    }
  }
}
