"use strict";
import {Scenario} from "./Scenario";
import {Scene} from "./components/Scene";

export class Engine {

  game: g.Game;

  constructor(game: g.Game) {
    this.game = game;
  }

  start(scenario?: Scenario): void {

    const s = scenario ? scenario : Scenario.load();

    const scene = new Scene(this.game, scenario);
    this.game.pushScene(scene);
  }
}
