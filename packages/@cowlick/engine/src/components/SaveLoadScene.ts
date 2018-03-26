"use strict";
import * as core from "@cowlick/core";
import {Config} from "@cowlick/config";
import {Button} from "./Button";
import {LabelButton} from "./LabelButton";
import {Scene} from "./Scene";
import {GameState} from "../models/GameState";

export interface SaveLoadSceneParameters {
  game: g.Game;
  scene: core.Scene;
  config: Config;
  assetIds: string[];
  gameState: GameState;
}

export class SaveLoadScene extends Scene {
  private config: Config;
  private button: Button;
  gameState: GameState;

  constructor(params: SaveLoadSceneParameters) {
    super({
      game: params.game,
      assetIds: SaveLoadScene.collectAssetIds(params)
    });

    this.config = params.config;
    this.gameState = params.gameState;

    this.loaded.add(this.onLoaded, this);
  }

  close() {
    if (this.game.scene() === this) {
      this.game.popScene(true);
    } else {
      throw new core.GameError("Current scene is not a save or load scene.");
    }
  }

  private onLoaded() {
    // TODO: configで差し替えられるようにする
    this.button = new LabelButton({
      scene: this,
      width: 100,
      height: 24,
      text: "close",
      fontSize: 18,
      config: this.config,
      gameState: this.gameState
    });
    this.button.move(this.game.width - 110, 10);

    this.button.onClick.add(this.close, this);
    this.append(this.button);
  }

  private static collectAssetIds(params: SaveLoadSceneParameters) {
    const assetIds = params.scene.assetIds.concat(core.collectAssetIds(params.config.window.system), params.assetIds);
    if (params.config.window.message.backgroundImage) {
      assetIds.push(params.config.window.message.backgroundImage);
    }
    return assetIds;
  }
}
