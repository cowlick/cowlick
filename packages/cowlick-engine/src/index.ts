"use strict";
import {Engine} from "./Engine";
export {ScriptFunction} from "./scripts/ScriptManager";
export {defaultSctipts} from "./scripts/defaultScripts";
export * from "./models/GameState";

/**
 * ノベルエンジンインスタンス
 */
export const engine = new Engine(g.game);
