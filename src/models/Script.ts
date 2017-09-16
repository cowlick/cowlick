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

export interface Jump {
  label: string;
}

export interface Script {
  tag: string;
  data: any;
}

export interface Choice extends Script {
  text: string;
}