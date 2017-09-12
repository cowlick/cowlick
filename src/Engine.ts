"use strict";
import {Scenario} from "./Scenario";
import {Scene} from "./components/Scene";

export class Engine {

  game: g.Game;

  constructor(game: g.Game) {
    this.game = game;
  }

  start(scenario?: Scenario): void {
    const scene = new Scene(this.game);
    this.game.pushScene(scene);
  }
}
