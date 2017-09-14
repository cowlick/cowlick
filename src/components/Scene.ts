"use strict";
import {Scenario} from "../Scenario";
import {Label} from "./Label";

export class Scene extends g.Scene {

  textLabel: Label;
  scenario: Scenario;

  constructor(game: g.Game, scenario: Scenario) {
    super({ game });

    this.scenario = scenario;

    this.loaded.handle(this, this.onLoaded);
  }

  onLoaded() {

    this.textLabel = new Label(this, this.scenario.next());
    this.append(this.textLabel);
  }
}
