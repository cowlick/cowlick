"use strict";
import {Engine} from "./Engine";
export {ScriptFunction} from "./scripts/ScriptManager";
export {defaultScripts} from "./scripts/defaultScripts";
export * from "./models/Snapshot";
export * from "./models/GameState";
export {SceneController} from "./components/SceneController";
export {GameScene} from "./components/GameScene";
export {SaveLoadScene} from "./components/SaveLoadScene";

/**
 * シングルプレー用ノベルエンジンインスタンス
 */
export const engine = new Engine(g.game, {id: "0"});

/**
 * マルチプレー用エンジンを準備する。
 *
 * @param player
 */
export const initialize = (player: g.Player, game?: g.Game) => {
  return new Engine(game ? game : g.game, player);
};
