"use strict";
import {Scenario} from "../models/Scenario";
import {Scene} from "../models/Scene";
import {Frame} from "../models/Frame";

export class ScenarioViewModel {

  private sceneTrigger: g.Trigger<Scene>;
  private frameTrigger: g.Trigger<Frame>;
  private scenario: Scenario;

  constructor(scenario: Scenario) {
    this.scenario = scenario;
    this.sceneTrigger = new g.Trigger<Scene>();
    this.frameTrigger = new g.Trigger<Frame>();
  }

  get source() {
    return this.scenario;
  }

  nextScene(callback: (scene: Scene) => void) {
    this.sceneTrigger.add(callback);
  }

  nextFrame(callback: (frame: Frame) => void) {
    this.frameTrigger.add(callback);
  }

  next(): void {
    const frame = this.source.nextFrame();
    if(frame) {
      this.frameTrigger.fire(frame);
    } else {
      const scene = this.source.nextScene();
      if(scene) {
        this.sceneTrigger.fire(scene);
      }
    }
  }
}
