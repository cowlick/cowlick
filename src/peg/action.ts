"use strict";
import * as script from "../models/Script";
import * as ast from "../parser/ast";
import {Tag, Layer} from "../Constant";

export interface KeyValuePair {
  key: string;
  value: any;
}

export function contents(c: script.Script<any>[], cs: script.Script<any>[][]) {

  var result = c;
  for(const c of cs) {
    result = result.concat(c);
  }
  return result;
}

export function frame(scripts: script.Script<any>[]): ast.Frame {
  return {
    scripts
  };
}

export function image(assetId: string, layer: string, options: KeyValuePair[]) {
  const result: script.Script<any> = {
    tag: Tag.image,
    data: {
      layer: {
        name: layer
      },
      assetId: assetId
    }
  };
  options.forEach(function (option) {
    result.data.layer[option.key] = option.value;
  });
  return result;
}

export function text(values: (string | script.Ruby[])[], cm: any) {
  const result: script.Script<script.Text> = {
    tag: Tag.text,
    data: {
      values: values
    }
  };
  if(cm) {
    result.data.clear = true;
  }
  return result;
}

function flatten(result: (string | script.Ruby[] | script.Variable)[], text: string, values: (string | script.Ruby[] | script.Variable)[]) {
  for(const v of values) {
    if(Array.isArray(v)) {
      if(text) {
        result.push(text);
        text = "";
      }
      result.push(v);
    } else if(typeof v === "string") {
      text += v;
    } else {
      if(text) {
        result.push(text);
        text = "";
      }
      result.push(v);
    }
  }
  return text;
}

export function textBlock(t: (string | script.Ruby[] | script.Variable)[], ts: (string | script.Ruby[] | script.Variable)[][]) {
  const result: (string | script.Ruby[] | script.Variable)[] = [];
  let text = flatten(result, "", t);
  for(const t of ts) {
    text = flatten(result, text, t);
  }
  if(text) {
    result.push(text);
  }
  return result;
}

export function textLine(values: (string | script.Ruby[] | script.Variable)[], top: any, end: any) {
  if(top) {
    if(typeof values[0] === "string") {
      values[0] = "\n" + values[0];
    } else {
      values = (["\n"] as (string | script.Ruby[] | script.Variable)[]).concat(values);
    }
  }
  if(end) {
    var last = values[values.length - 1];
    if(typeof last === "string") {
      values[values.length - 1] = last + "\n";
    } else {
      values.push("\n");
    }
  }
  const result: (string | script.Ruby[] | script.Variable)[] = [];
  let text = flatten(result, "", values);
  if(text) {
    result.push(text);
  }
  return result;
}

export function ruby(rb: string, rt: string): script.Ruby[] {
  return [{
    value: JSON.stringify({
      rb: rb,
      rt: rt
    })
  }];
}

export function variable(expression: string): script.Variable {
  // TODO: 真面目に解析する
  const value = expression.split(".");
  return {
    type: value[0] === "sf" ? "system" : "current",
    name: value[1]
  };
}

export function playAudio(assetId: string, name: string): script.Script<script.Audio> {
  return {
    tag: Tag.playAudio,
    data: {
      assetId: assetId,
      groupName: name
    }
  };
}

export function stopAudio(name: string): script.Script<script.Audio> {
  return {
    tag: Tag.stopAudio,
    data: {
      assetId: null,
      groupName: name
    }
  };
}

export function tag(name: string, attrs: KeyValuePair[]) {
  const result: script.Script<any> = {
    tag: name,
    data: {}
  };
  for(const attr of attrs) {
    result.data[attr.key] = attr.value;
  }
  return result;
}

export function evaluate(expression: string): script.Script<ast.Eval> {
  return {
    tag: Tag.evaluate,
    data: {
      expression
    }
  };
}

export function trigger(enabled: boolean): script.Script<script.Trigger> {
  return {
    tag: Tag.trigger,
    data: enabled ? script.Trigger.On : script.Trigger.Off
  };
}

export function choice(l: ast.ChoiceItem, ls: ast.ChoiceItem[]): script.Script<ast.Choice> {
  return {
    tag: Tag.choice,
    data: {
      layer: {
        name: Layer.choice
      },
      values: [l].concat(ls)
    }
  };
}

export function choiceItem(frame: string, text: string, scene?: string) {
  const result: ast.ChoiceItem = {
    tag: Tag.jump,
    data: {
      frame
    },
    text
  };
  if(scene) {
    result.data.scene = scene;
  }
  return result;
}

export function layerConfig(name: string, options: KeyValuePair[]) {
  const result: script.Script<any> = {
    tag: Tag.layerConfig,
    data: {
      name
    }
  };
  for(const option of options) {
    result.data[option.key] = option.value;
  }
  return result;
}

export function click(scripts: script.Script<any>[]): script.Script<script.Script<any>[]> {
  return {
    tag: Tag.click,
    data: scripts
  };
}
