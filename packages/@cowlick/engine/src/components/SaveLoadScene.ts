import * as core from "@cowlick/core";
import {Config} from "@cowlick/config";
import {Button} from "./Button";
import {LabelButton} from "./LabelButton";
import {Scene} from "./Scene";
import {GameState} from "../models/GameState";

export interface SaveLoadSceneParameters {
  scene: g.Scene;
  config: Config;
  gameState: GameState;
}

export class SaveLoadScene implements Scene {
  private scene: g.Scene;
  private config: Config;
  private button: Button;
  private _gameState: GameState;

  constructor(params: SaveLoadSceneParameters) {
    this.scene = params.scene;
    this.config = params.config;
    this._gameState = params.gameState;

    // TODO: configで差し替えられるようにする
    this.button = new LabelButton({
      scene: this.scene,
      width: 100,
      height: 24,
      text: "close",
      fontSize: 18,
      config: this.config,
      gameState: params.gameState
    });
    this.button.move(this.game.width - 110, 10);

    this.button.click.add(this.close, this);
    this.scene.append(this.button);
  }

  get body(): g.Scene {
    return this.scene;
  }

  get gameState(): GameState {
    return this._gameState;
  }

  close() {
    if (this.game.scene() === this.scene) {
      this.game.popScene(true);
    } else {
      throw new core.GameError("Current scene is not a save or load scene.");
    }
  }

  private get game() {
    return this.scene.game;
  }
}
