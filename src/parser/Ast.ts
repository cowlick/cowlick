import {LayerConfig, Script} from "../models/Script";

export interface Choice {
  layer: LayerConfig;
  values: ChoiceItem[];
}

export interface Jump {
  scene?: string;
  frame: string;
}

export interface ChoiceItem extends Script<Jump> {
  text: string;
}

export interface Eval {
  expression: string;
}
  