"use strict";
import * as estree from "estree";
import * as esprima from "esprima";
import * as estraverse from "estraverse";
import * as core from "cowlick-core";
import * as ast from "cowlick-analyzer";
import { Script } from "cowlick-core";

export interface KeyValuePair {
  key: string;
  value: any;
}

export let dependencies: string[];

export function contents(c: core.Script<any>[], cs: core.Script<any>[][]): core.Script<any>[] {

  var result = c;
  for(const c of cs) {
    result = result.concat(c);
  }
  return result;
}

export function frame(scripts: core.Script<any>[], label?: string): ast.Frame {
  const result: ast.Frame = {
    scripts
  };
  if(label) {
    result.label = label;
  }
  return result;
}

export function image(assetId: string, layer: string, options: KeyValuePair[]): core.Script<any> {
  const result: core.Script<any> = {
    tag: core.Tag.image,
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

export function text(values: (string | core.Ruby[])[], cm: any): core.Script<core.Text> {
  const result: core.Script<core.Text> = {
    tag: core.Tag.text,
    data: {
      values: values
    }
  };
  if(cm) {
    result.data.clear = true;
  }
  return result;
}

function flatten(result: (string | core.Ruby[] | core.Variable)[], text: string, values: (string | core.Ruby[] | core.Variable)[]) {
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

export function textBlock(t: (string | core.Ruby[] | core.Variable)[], ts: (string | core.Ruby[] | core.Variable)[][])
  : (string | core.Ruby[] | core.Variable)[] {
  const result: (string | core.Ruby[] | core.Variable)[] = [];
  let text = flatten(result, "", t);
  for(const t of ts) {
    text = flatten(result, text, t);
  }
  if(text) {
    result.push(text);
  }
  return result;
}

export function textLine(values: (string | core.Ruby[] | core.Variable)[], top: any, end: any)
  : (string | core.Ruby[] | core.Variable)[] {
  if(top) {
    if(typeof values[0] === "string") {
      values[0] = "\n" + values[0];
    } else {
      values = (["\n"] as (string | core.Ruby[] | core.Variable)[]).concat(values);
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
  const result: (string | core.Ruby[] | core.Variable)[] = [];
  let text = flatten(result, "", values);
  if(text) {
    result.push(text);
  }
  return result;
}

export function ruby(rb: string, rt: string): core.Ruby[] {
  return [{
    value: JSON.stringify({
      rb: rb,
      rt: rt
    })
  }];
}

const varSf = "sf";
const varF = "f";

export function variable(expression: string): core.Variable {
  let value: core.Variable;
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
                  type: core.VariableType.system,
                  name: e.property.name
                };
                break;
              case varF:
                value = {
                  type: core.VariableType.current,
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

export function playAudio(assetId: string, group: string): core.Script<core.Audio> {
  return {
    tag: core.Tag.playAudio,
    data: {
      assetId: assetId,
      group
    }
  };
}

export function stopAudio(group: string): core.Script<core.Audio> {
  return {
    tag: core.Tag.stopAudio,
    data: {
      assetId: null,
      group
    }
  };
}

export function tryParseLiteral(value: string) {
  let parsed: any = parseInt(value, 10);
  if(isNaN(parsed)) {
    parsed = parseFloat(value);
  }
  if(isNaN(parsed)) {
    if(value === "true") {
      parsed = true;
    } else if(value === "false") {
      parsed = false;
    } else {
      parsed = value;
    }
  }
  return parsed;
}

export function tag(name: string, attrs: KeyValuePair[]): core.Script<any> {
  const result: core.Script<any> = {
    tag: name,
    data: {}
  };
  for(const attr of attrs) {
    result.data[attr.key] = tryParseLiteral(attr.value);
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
              newObject = newMemberExpression(core.VariableType.system);
              break;
            case varF:
              newObject = newMemberExpression(core.VariableType.current);
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

export function evaluate(expression: string): core.Script<estree.Program> {
  return {
    tag: core.Tag.evaluate,
    data: traverseEval(esprima.parseScript(expression))
  };
}

export function condition(expression: string, scripts: core.Script<any>[]): core.Script<ast.Condition> {
  return {
    tag: core.Tag.condition,
    data: {
      expression: traverseEval(esprima.parseScript(expression)),
      scripts
    }
  };
}

export function trigger(enabled: boolean): core.Script<core.Trigger> {
  return {
    tag: core.Tag.trigger,
    data: enabled ? core.Trigger.On : core.Trigger.Off
  };
}

export function jump(data: ast.Jump): core.Script<ast.Jump> {
  if (data.scene) {
    dependencies.push(data.scene);
  }
  return {
    tag: core.Tag.jump,
    data
  };
}

export function choice(l: ast.ChoiceItem, ls: ast.ChoiceItem[]): core.Script<ast.Choice> {
  return {
    tag: core.Tag.choice,
    data: {
      layer: {
        name: core.Layer.choice
      },
      values: [l].concat(ls)
    }
  };
}

export function choiceItem(text: string, data: ast.Jump, condition?: string): ast.ChoiceItem {
  if (data.scene) {
    dependencies.push(data.scene);
  }
  const result: ast.ChoiceItem = {
    tag: core.Tag.jump,
    data,
    text
  };
  if(condition) {
    result.condition = traverseEval(esprima.parseScript(condition));
  }
  return result;
}

export function layerConfig(name: string, options: KeyValuePair[]): core.Script<any> {
  const result: core.Script<any> = {
    tag: core.Tag.layerConfig,
    data: {
      name
    }
  };
  for(const option of options) {
    result.data[option.key] = option.value;
  }
  return result;
}

export function click(scripts: core.Script<any>[]): core.Script<core.Script<any>[]> {
  return {
    tag: core.Tag.click,
    data: scripts
  };
}

export function clearSystemVariables(): core.Script<any> {
  return {
    tag: core.Tag.clearSystemVariables,
    data: {}
  };
}

export function clearCurrentVariables(): core.Script<any> {
  return {
    tag: core.Tag.clearCurrentVariables,
    data: {}
  };
}

export function timeout(data: core.Timeout): core.Script<core.Timeout> {
  return {
    tag: core.Tag.timeout,
    data
  };
}

export function ifExpression(data: ast.IfElse): core.Script<ast.IfElse> {
  return {
    tag: core.Tag.ifElse,
    data
  };
}

export function waitTransition(scripts: core.Script<any>[], skippable?: boolean): core.Script<any>[] {
  const result: core.Script<core.WaitTransition> = {
    tag: core.Tag.waitTransition,
    data: {
      scripts
    }
  };
  if(typeof skippable !== "undefined") {
    result.data.skippable = skippable;
  }
  return [result];
}

export function button(data: core.Button): core.Script<core.Button> {
  return {
    tag: core.Tag.button,
    data
  };
}

export function removeLayer(name: string): core.Script<core.RemoveLayer> {
  return {
    tag: core.Tag.removeLayer,
    data: {
      name
    }
  };
}
