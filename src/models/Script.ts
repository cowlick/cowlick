export interface LayerConfig {
  name: string;
  opacity?: number;
}

export interface Image {
  assetId: string;
  layer: LayerConfig;
  x?: number;
  y?: number;
  frame?: {
    width: number;
    height: number;
    scale: number;
    frames: number[];
  };
}

export interface Pane {
  layer: LayerConfig;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  backgroundImage?: string;
  padding?: number;
  backgroundEffector?: {
    borderWidth: number;
  };
  touchable?: boolean;
}

export interface Button {
  layer: LayerConfig;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundImage?: string;
  padding?: number;
  backgroundEffector?: {
    borderWidth: number;
  };
  scripts: Script[];
}

export interface Text {
  value: string;
}

export interface Jump {
  label: string;
  frame?: number
}

export interface Script {
  tag: string;
  data: any;
}

export function collectAssetIds(scripts: Script[]): string[] {
  let ids: string[] = [];
  for(const s of scripts) {
    if(typeof(s.data) === "object") {
      if(s.data.assetId) {
        ids.push(<string>s.data.assetId);
      } else if(s.data.backgroundImage) {
        ids.push(<string>s.data.backgroundImage);
      }
    }
  }
  return ids;
}

export interface ChoiceItem extends Script {
  text: string;
}

export const enum Trigger {
  On,
  Off
}

export const enum Direction {
  Vertical,
  Horizontal
}

export interface Choice {
  layer: LayerConfig;
  values: ChoiceItem[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  direction?: Direction;
  backgroundImage?: string;
  padding?: number;
  backgroundEffector?: {
    borderWidth: number;
  };
}

export interface Visibility {
  layer: string;
  visible: boolean;
}

export interface Audio {
  assetId: string;
}

export interface Video {
  assetId: string;
}

export interface Save {
  index: number;
  force?: boolean;
}

export interface Load {
  index: number;
}
