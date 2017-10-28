"use strict";
import {Button} from "./Button";
import {LabelButton} from "./LabelButton";
import {collectAssetIds} from "../models/Script";
import {Scene} from "../models/Scene";
import {ScriptManager} from "../scripts/ScriptManager";
import {Config} from "../Config";

export interface SaveLoadSceneParameters {
  game: g.Game;
  scene: Scene;
  config: Config;
  scriptManager: ScriptManager;
  assetIds: string[];
}

export class SaveLoadScene extends g.Scene {
    
  private config: Config;
  private button: Button;
  private scriptManager: ScriptManager; 
    
  constructor(params: SaveLoadSceneParameters) {
    super({
      game: params.game,
      assetIds: SaveLoadScene.collectAssetIds(params)
    });
    
    this.config = params.config;
    this.scriptManager = params.scriptManager;

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
      config: this.config
    });
    this.button.move(this.game.width - 110, 10);

    this.button.click.add(
      () => {
        this.game.popScene(false);
      },
      this
    );
  }

  private static collectAssetIds(params: SaveLoadSceneParameters) {
    const assetIds = params.scene.assetIds
      .concat(collectAssetIds(params.config.window.system), params.assetIds);
    if(params.config.window.message.backgroundImage) {
      assetIds.push(params.config.window.message.backgroundImage);
    }
    return assetIds;
  }
}