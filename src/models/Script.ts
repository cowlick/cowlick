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
  assetId: string;
  x: number;
  y: number;
  scripts: Script<any>[];
}

export interface RubyText {
  value: string;
}

export interface Text {
  clear?: boolean;
  values: (string | RubyText[]) [];
}

export interface Jump {
  label: string;
  frame?: number
}

export interface Script<T> {
  tag: string;
  data: T;
}

export function collectAssetIds(scripts: Script<any>[]): string[] {
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

export interface ChoiceItem extends Script<Jump> {
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

export interface Link {
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
  text: string
  scripts: Script<any>[];
}

export interface Visibility {
  layer: string;
  visible: boolean;
}

export interface Audio {
  assetId: string;
  groupName?: string;
}

export interface ChangeVolume {
  groupName: string;
  volume: number;
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

export interface Eval {
  path: string;
}

export interface Condition<T> extends Eval {
  script: Script<T>;
}

export interface RemoveLayer {
  name: string;
}
