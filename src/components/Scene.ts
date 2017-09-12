"use strict";
import {Label} from "./Label";

export class Scene extends g.Scene {

  textLabel: Label;

  constructor(game: g.Game) {
    super({ game });
  }
}
