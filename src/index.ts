"use strict";
import {Engine} from "./Engine";
export * from "./Config";
export {Tag, Layer} from "./Constant";
export {ScriptFunction} from "./scripts/ScriptManager";
export * from "./models/Scenario";
export * from "./models/Scene";
export * from "./models/Frame";
export * from "./models/Script";
export * from "./models/GameState";
export {Log} from "./models/Log";
export * from "./models/GameError";

export const engine = new Engine(g.game);
