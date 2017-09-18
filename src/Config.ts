import {Pane, Script} from "./models/Script";
import {Layer} from "./Constant";

export interface PaneConfig {
  assetId: string;
  borderWidth?: number;
}

export interface FontConfig {
  color: string;
}

export interface WindowConfig {
  message: Pane;
  // TODO: 制限を強める
  system: Script[];
}

export interface Config {
  window: WindowConfig;
  pane: PaneConfig;
  font: FontConfig;
}

export const defaultConfig: Config = {
  window: {
    message: {
      layer: {
        name: Layer.message
      },
      width: g.game.width - 20,
      height: g.game.height - 20,
      x: 10,
      y: 10,
      touchable: true
    },
    system: []
  },
  pane: {
    assetId: "pane"
  },
  font: {
    color: "black"
  }
}
