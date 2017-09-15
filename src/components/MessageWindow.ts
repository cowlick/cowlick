"use strict";
import {Label} from "./Label";
import {Scenario} from "../Scenario";

export class MessageWindow extends g.Pane {

  textLabel: Label;
  scenario: Scenario;

  constructor(scene: g.Scene, scenario: Scenario) {
    super({
      scene,
      width: scene.game.width,
      height: scene.game.height / 4,
      x: 0,
      y: scene.game.height - scene.game.height / 4,
    });

    this.scenario = scenario;

    this.textLabel = new Label(scene, this.scenario.next());
    this.append(this.textLabel);
  }
}
