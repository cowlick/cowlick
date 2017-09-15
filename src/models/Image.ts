export interface Image {
  assetId: string;
  layer: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scale?: number;
  frames?: number[];
}
