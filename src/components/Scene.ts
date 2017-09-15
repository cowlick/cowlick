"use strict";
import {Scenario} from "../Scenario";
import {MessageWindow} from "./MessageWindow";

export class Scene extends g.Scene {

  messageWindow: MessageWindow;
  scenario: Scenario;

  constructor(game: g.Game, scenario: Scenario) {
    super({ game });

    this.scenario = scenario;

    this.loaded.handle(this, this.onLoaded);
  }

  onLoaded() {

    this.messageWindow = new MessageWindow(this, this.scenario);
    this.append(this.messageWindow);
  }
}
