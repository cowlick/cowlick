"use strict";
import * as estree from "estree";
import * as esprima from "esprima";
import * as estraverse from "estraverse";
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

export function frame(scripts: script.Script<any>[], label?: string): ast.Frame {
  const result: ast.Frame = {
    scripts
  };
  if(label) {
    result.label = label;
  }
  return result;
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

const system = "system";
const current = "current";
const varSf = "sf";
const varF = "f";

export function variable(expression: string): script.Variable {
  let value: script.Variable;
  estraverse.traverse(esprima.parseScript(expression), {
    enter: function(node, parent) {
      if(node.type === "Program" && node.body.length === 1) {
        const statement = node.body[0];
        if(statement.type === "ExpressionStatement") {
          const e = statement.expression;
          if(e.type === "MemberExpression" && e.object.type === "Identifier" && e.property.type === "Identifier") {
            switch(e.object.name) {
              case varSf:
                value = {
                  type: system,
                  name: e.property.name
                };
                break;
              case varF:
                value = {
                  type: current,
                  name: e.property.name
                };
                break;
            }
            this.break();
          }
        }
      }
    }
  });
  if(value) {
    return value;
  } else {
    throw new Error(`illegal expression(call variable): ${expression}`);
  }
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

function newMemberExpression(name: string): estree.MemberExpression {
  return {
    type: "MemberExpression",
    object: {
      type: "Identifier",
      name: "variables"
    },
    property: {
      type: "Identifier",
      name
    },
    computed: false
  };
}

function traverseEval(original: estree.Program): estree.Program {
  estraverse.traverse(original, {
    leave: (node, parent) => {
      if(node.type === "MemberExpression") {
        const object = node.object;
        if(object.type === "Identifier") {
          let newObject: estree.MemberExpression;
          switch(object.name) {
            case varSf:
              newObject = newMemberExpression(system);
              break;
            case varF:
              newObject = newMemberExpression(current);
              break;
            default:
              throw new Error(`"${object.name}" is a invalid variable name.`);
          }
          node.object = newObject;
        }
      }
    }
  });
  return original;
}

export function evaluate(expression: string): script.Script<estree.Program> {
  return {
    tag: Tag.evaluate,
    data: traverseEval(esprima.parseScript(expression))
  };
}

export function condition(expression: string, scripts: script.Script<any>[]): script.Script<ast.Condition> {
  return {
    tag: Tag.condition,
    data: {
      expression: traverseEval(esprima.parseScript(expression)),
      scripts
    }
  };
}

export function trigger(enabled: boolean): script.Script<script.Trigger> {
  return {
    tag: Tag.trigger,
    data: enabled ? script.Trigger.On : script.Trigger.Off
  };
}

export function jump(data: ast.Jump): script.Script<ast.Jump> {
  return {
    tag: Tag.jump,
    data
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

export function choiceItem(text: string, data: ast.Jump, condition?: string): ast.ChoiceItem {
  const result: ast.ChoiceItem = {
    tag: Tag.jump,
    data,
    text
  };
  if(condition) {
    result.condition = traverseEval(esprima.parseScript(condition))
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

export function clearSystemVariables(): script.Script<any> {
  return {
    tag: Tag.clearSystemVariables,
    data: {}
  }
}

export function clearCurrentVariables(): script.Script<any> {
  return {
    tag: Tag.clearCurrentVariables,
    data: {}
  }
}
