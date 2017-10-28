import {Pane, Script} from "./models/Script";
import {Layer} from "./Constant";

export interface FontConfig {
  list: g.Font[];
  selected: number;
  color: string;
}

export interface WindowConfig {
  message: Pane;
  // TODO: 制限を強める
  system: Script<any>[];
  load: Script<any>[];
  save: Script<any>[];
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
        name: Layer.message,
        x: 10,
        y: 10
      },
      width: g.game.width - 20,
      height: g.game.height - 20,
      touchable: true
    },
    system: [],
    load: [],
    save: []
  },
  font: {
    list: [
      new g.DynamicFont({
        game: g.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
      })
    ],
    selected: 0,
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
