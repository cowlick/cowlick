import {GameState} from "../models/GameState";

export interface Scene {
  body: g.Scene;
  gameState: GameState;
}
