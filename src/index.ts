"use strict";
import {Engine} from "./Engine";
export * from "./Config";
export * from "./Constant";
export {ScriptFunction} from "./ScriptManager";
export * from "./models/Scenario";
export * from "./models/Scene";
export * from "./models/Frame";
export * from "./models/Script";
export * from "./models/GameState";

export const engine = new Engine(g.game);
