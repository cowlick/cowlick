export interface LayerConfig {
  name: string;
  x?: number;
  y?: number;
  opacity?: number;
  visible?: boolean;
}

export interface Image {
  assetId: string;
  layer: LayerConfig;
  frame?: {
    width: number;
    height: number;
    scale: number;
    frames: number[];
  };
}

export interface Pane {
  layer: LayerConfig;
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

export interface Ruby {
  value: string;
}

export interface Variable {
  type: string;
  name: string;
}

export interface Text {
  clear?: boolean;
  values: (string | Ruby[] | Variable) [];
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
  path?: string;
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
  text: string;
  scripts: Script<any>[];
}

export interface Audio {
  assetId: string;
  group?: string;
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

export interface Condition extends Eval {
  scripts: Script<any>[];
}

export interface RemoveLayer {
  name: string;
}

export interface Backlog {
  scripts: Script<any>[];
}

export interface Fade {
  layer: string;
  duration: number;
}

export interface Timeout {
  milliseconds: number;
  scripts: Script<any>[];
}

export interface IfElse {
  conditions: Condition[];
  elseBody: Script<any>[];
}
