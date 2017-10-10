"use strict";
import {Scenario} from "../models/Scenario";
import {Frame} from "../models/Frame";

export class ScenarioViewModel {

  frame: g.Trigger<Frame>;
  private scenario: Scenario;
  private log: Frame[];

  constructor(scenario: Scenario) {
    this.scenario = scenario;
    this.frame = new g.Trigger<Frame>();
    this.log = [];
  }

  get source() {
    return this.scenario;
  }

  get backlog() {
    return this.log;
  }

  set backlog(values: Frame[]) {
    this.log = values;
  }

  load(frame?: Frame): boolean {
    const f = frame ? frame : this.source.frame;
    if(f) {
      this.frame.fire(f);
      return true;
    } else {
      return false;
    }
  }

  next(): boolean {
    const previous = this.source.frame;
    if(this.load(this.source.nextFrame())) {
      this.log.push(previous);
      return true;
    } else {
      return false;
    }
  }
}
