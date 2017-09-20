import {Pane, Script} from "./models/Script";
import {Layer} from "./Constant";

export interface FontConfig {
  color: string;
}

export interface WindowConfig {
  message: Pane;
  // TODO: 制限を強める
  system: Script[];
}

export interface SystemConfig {
  maxSaveCount: number;
}

export interface Config {
  window: WindowConfig;
  font: FontConfig;
  system: SystemConfig;
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
  font: {
    color: "black"
  },
  system: {
    maxSaveCount: 100
  }
}
