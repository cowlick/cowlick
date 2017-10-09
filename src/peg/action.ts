"use strict";
import * as script from "../models/Script";
import * as ast from "../parser/Ast";
import {Tag, Layer} from "../Constant";

export function contents(c: any, cs: any[]) {
  "use strict";

  var result = [c];
  if (cs) {
    if (Array.isArray(cs)) {
      cs.forEach(function(c) { result.push(c); });
    } else {
      result.push(cs);
    }
  }
  return result;
}

export function image(assetId: string, layer: string, options: { name: string, value: any }[]) {
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
    result.data[option.name] = option.value;
  });
  return result;
}

export function text(values: (string | script.RubyText[])[], cm: any) {
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

function flatten(result: (string | script.RubyText[])[], text: string, values: (string | script.RubyText[])[]) {
  for(const v of values) {
    if(Array.isArray(v)) {
      if(text) {
        result.push(text);
        text = "";
      }
      result.push(v);
    } else {
      text += v;
    }
  }
  return text;
}

export function textBlock(t: (string | script.RubyText[])[], ts: (string | script.RubyText[])[][]) {
  const result: (string | script.RubyText[])[] = [];
  let text = flatten(result, "", t);
  for(const t of ts) {
    text = flatten(result, text, t);
  }
  if(text) {
    result.push(text);
  }
  return result;
}

export function textLine(values: (string | script.RubyText[])[], top: any, end: any) {
  if(top) {
    if(typeof values[0] === "string") {
      values[0] = "\n" + values[0];
    } else {
      values = (["\n"] as (string | script.RubyText[])[]).concat(values);
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
  const result: (string | script.RubyText[])[] = [];
  let text = flatten(result, "", values);
  if(text) {
    result.push(text);
  }
  return result;
}

export function ruby(rb: string, rt: string): script.RubyText[] {
  return [{
    value: JSON.stringify({
      rb: rb,
      rt: rt
    })
  }];
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

export function tag(name: string, attrs: { name: string, value: any }[]) {
  const result: script.Script<any> = {
    tag: name,
    data: {}
  }
  for(const attr of attrs) {
    result.data[attr.name] = attr.value;
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
