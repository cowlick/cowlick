export interface Image {
  assetId: string;
  layer: string;
  x?: number;
  y?: number;
  frame?: {
    width: number;
    height: number;
    scale: number;
    frames: number[];
  };
}

export interface Text {
  value: string;
}

export interface Jump {
  label: string;
}

export interface Script {
  tag: string;
  data: any;
}

export interface ChoiceItem extends Script {
  text: string;
}

export const enum Trigger {
  Enable,
  Disable
}

export const enum Direction {
  Vertical,
  Horizontal
}

export interface Choice {
  layer: string;
  values: ChoiceItem[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  direction?: Direction;
  assetId?: string;
  windowTrigger?: Trigger;
}

export interface Visibility {
  layer: string;
  visible: boolean;
}