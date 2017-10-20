"use strict";
import {Scene} from "./Scene";
import {Frame} from "./Frame";
import {Jump} from "./Script";
import {SaveData} from "./SaveData";
import {Log} from "./Log";

export class Scenario {

  private index = 0;
  private scenes: Scene[];
  onLoaded: g.Trigger<Frame>;
  private log: Log[];

  constructor(scenes: Scene[]) {
    this.scenes = scenes;
    this.onLoaded = new g.Trigger<Frame>();
    this.log = [];
  }

  static load(game: g.Game): Scenario {
    return g._require(game, "scenario");
  }

  get backlog() {
    return this.log;
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
      this.onLoaded.fire(f);
      return true;
    } else {
      return false;
    }
  }

  next(): boolean {
    return this.load(this.nextFrame());
  }

  findScene(data: SaveData): Scene {
    return this.scenes.find(s => s.label === data.label);
  }

  clear() {
    this.log = [];
    this.onLoaded.removeAll();
  }

  pushLog(log: Log) {
    this.log.push(log);
  }

  private nextFrame() {
    if(this.index < this.scenes.length) {
      return this.scenes[this.index].next();
    } else {
      return undefined;
    }
  }
}
