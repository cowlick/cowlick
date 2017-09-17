"use strict";
import {Scenario} from "../models/Scenario";
import {Scene} from "../models/Scene";
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

  nextFrame(callback: (frame: Frame) => void) {
    this.frameTrigger.add(callback);
  }

  next(): boolean {
    const frame = this.source.nextFrame();
    if(frame) {
      this.frameTrigger.fire(frame);
      return true;
    } else {
      return false;
    }
  }
}
