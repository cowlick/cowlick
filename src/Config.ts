export interface PaneConfig {
  assetId: string;
  borderWidth?: number;
}

export interface FontConfig {
  color: string;
}

export interface Config {
  pane: PaneConfig;
  font: FontConfig;
}

export const defaultConfig: Config = {
  pane: {
    assetId: "pane"
  },
  font: {
    color: "black"
  }
}
