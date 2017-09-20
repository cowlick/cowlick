"use strict";
import {Scenario} from "../models/Scenario";
import {Frame} from "../models/Frame";

export class ScenarioViewModel {

  private frameTrigger: g.Trigger<Frame>;
  private scenario: Scenario;

  constructor(scenario: Scenario) {
    this.scenario = scenario;
    this.frameTrigger = new g.Trigger<Frame>();
  }

  get source() {
    return this.scenario;
  }

  loadFrame(callback: (frame: Frame) => void) {
    this.frameTrigger.add(callback);
  }

  load(frame?: Frame): boolean {
    const f = frame ? frame : this.source.scene.frame;
    if(f) {
      this.frameTrigger.fire(f);
      return true;
    } else {
      return false;
    }
  }

  next(): boolean {
    return this.load(this.source.nextFrame());
  }
}
