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

export interface AudioConfig {
  voice: number;
  se: number;
  bgm: number;
}

export interface Config {
  window: WindowConfig;
  font: FontConfig;
  system: SystemConfig;
  audio: AudioConfig;
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
  },
  audio: {
    voice: 0.5,
    se: 0.5,
    bgm: 0.5
  }
};
