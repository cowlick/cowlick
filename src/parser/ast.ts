import {LayerConfig, Script} from "../models/Script";

export type Scenario = Scene[];

export interface Scene {
  label: string;
  frames: Frame[];
}

export interface Frame {
  scripts: Script<any>[];
  label?: string;
}

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

