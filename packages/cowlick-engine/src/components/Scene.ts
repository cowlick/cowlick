"use strict";
import {LayerConfig} from "cowlick-core";
import {GameState} from "../models/GameState";

export abstract class Scene extends g.Scene {
  abstract get gameState(): GameState;
}
