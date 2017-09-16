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
