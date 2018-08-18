import * as estree from "estree";
import * as core from "@cowlick/core";

export type Scenario = Scene[];

export interface Scene {
  label: string;
  frames: Frame[];
}

export interface Frame {
  scripts: Script[];
  label?: string;
}

export type Script =
  | core.Layer
  | core.Image
  | core.FrameImage
  | core.Pane
  | Button
  | core.Text
  | Jump
  | core.Trigger
  | Choice
  | Link
  | core.PlayAudio
  | core.StopAudio
  | core.ChangeVolume
  | core.Video
  | core.Save
  | core.Load
  | Eval
  | Condition
  | core.RemoveLayer
  | Backlog
  | core.Fade
  | Timeout
  | IfElse
  | core.Slider
  | core.SaveLoadScene
  | core.MessageSpeed
  | core.Font
  | core.RealTimeDisplay
  | Click
  | core.Skip
  | core.ClearSystemVariables
  | core.ClearCurrentVariables
  | core.AutoMode
  | WaitTransition
  | core.Extension;

export interface Button extends core.ScriptNode {
  tag: core.Tag.button;
  image: core.Image;
  x: number;
  y: number;
  scripts: Script[];
}

export interface Choice extends core.ScriptNode {
  tag: core.Tag.choice;
  layer: core.LayerConfig;
  values: ChoiceItem[];
}

export interface Jump extends core.ScriptNode {
  tag: core.Tag.jump;
  scene?: string;
  frame?: string;
}

export interface ChoiceItem extends Jump {
  text: string;
  condition?: estree.Node;
}

export interface Link extends core.ScriptNode, core.PaneDefinition {
  tag: core.Tag.link;
  width: number;
  height: number;
  text: string;
  fontSize?: number;
  scripts: Script[];
}

export interface Eval extends core.ScriptNode {
  tag: core.Tag.evaluate;
  program: estree.Node;
}

export interface Condition extends core.ScriptNode {
  tag: core.Tag.condition;
  expression: estree.Node;
  scripts: Script[];
}

export interface Backlog extends core.ScriptNode {
  tag: core.Tag.backlog;
  scripts: Script[];
}

export interface Timeout extends core.ScriptNode {
  tag: core.Tag.timeout;
  milliseconds: number;
  scripts: Script[];
}

export interface IfElse extends core.ScriptNode {
  tag: core.Tag.ifElse;
  conditions: Condition[];
  elseBody: Script[];
}

export interface Click extends core.ScriptNode {
  tag: core.Tag.click;
  scripts: Script[];
}

export interface WaitTransition extends core.ScriptNode {
  tag: "waitTransition";
  scripts: Script[];
  skippable?: boolean;
}
