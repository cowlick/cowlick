"use strict";
import {Scene} from "./Scene";
import {Frame} from "./Frame";
import {Jump} from "./Script";
import {SaveData} from "./SaveData";
import {Log} from "./Log";
import {GameError} from "./GameError";

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
      throw new GameError("scene not found", { index: this.index });
    }
  }

  get frame() {
    return this.scene.frame;
  }

  update(target: Jump) {
    const i = this.scenes.findIndex(s => s.label === target.label);
    if(i > -1) {
      this.index = i;
      this.scenes[this.index].reset(target.frame);
    } else {
      throw new GameError("scene not found", target);
    }
  }

  load(frame?: Frame) {
    const f = frame ? frame : this.frame;
    if(f) {
      this.onLoaded.fire(f);
    } else {
      throw new GameError("target frame not found");
    }
  }

  next() {
    this.load(this.scene.next());
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
}
