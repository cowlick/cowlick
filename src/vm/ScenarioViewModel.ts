"use strict";
import {Scenario} from "../models/Scenario";
import {Frame} from "../models/Frame";

export class ScenarioViewModel {

  private frameTrigger: g.Trigger<Frame>;
  private scenario: Scenario;
  private log: Frame[];

  constructor(scenario: Scenario) {
    this.scenario = scenario;
    this.frameTrigger = new g.Trigger<Frame>();
    this.log = [];
  }

  get source() {
    return this.scenario;
  }

  get backlog() {
    return this.log;
  }

  loadFrame(callback: (frame: Frame) => void) {
    this.frameTrigger.add(callback);
  }

  load(frame?: Frame): boolean {
    const f = frame ? frame : this.source.frame;
    if(f) {
      this.frameTrigger.fire(f);
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
