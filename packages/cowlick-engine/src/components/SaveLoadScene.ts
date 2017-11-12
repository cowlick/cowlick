"use strict";
import * as core from "cowlick-core";
import {Button} from "./Button";
import {LabelButton} from "./LabelButton";
import {Scene} from "./Scene";
import {GameState} from "../models/GameState";
import {ScriptManager} from "../scripts/ScriptManager";

export interface SaveLoadSceneParameters {
  game: g.Game;
  scene: core.Scene;
  config: core.Config;
  assetIds: string[];
  gameState: GameState;
}

export class SaveLoadScene extends Scene {

  private config: core.Config;
  private button: Button;
  gameState: GameState;

  constructor(params: SaveLoadSceneParameters) {
    super({
      game: params.game,
      assetIds: SaveLoadScene.collectAssetIds(params)
    });

    this.config = params.config;

    this.loaded.add(this.onLoaded, this);
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

    this.button.onClick.add(
      () => {
        this.game.popScene(true);
      },
      this
    );
  }

  private static collectAssetIds(params: SaveLoadSceneParameters) {
    const assetIds = params.scene.assetIds
      .concat(core.collectAssetIds(params.config.window.system), params.assetIds);
    if(params.config.window.message.backgroundImage) {
      assetIds.push(params.config.window.message.backgroundImage);
    }
    return assetIds;
  }
}
