import * as acorn from "acorn";
import * as estree from "estree";
import * as estraverse from "estraverse";
import * as core from "@cowlick/core";
import * as ast from "@cowlick/analyzer";
import * as path from "path";

export interface KeyValuePair {
  key: string;
  value: any;
}

export interface Context {
  base: string;
  relative: string;
  dependencies: string[];
}

let context: Context;

export const setup = (ctx: Context) => {
  context = ctx;
};

export const contents = (c: ast.Script[], cs: ast.Script[][]): ast.Script[] => {
  var result = c;
  for (const c of cs) {
    result.push(...c);
  }
  return result;
};

export const frames = (frames: ast.Frame[]) => {
  return {
    dependencies: context.dependencies,
    frames
  };
};

export const frame = (scripts: ast.Script[], label?: string): ast.Frame => {
  const result: ast.Frame = {
    scripts
  };
  if (label) {
    result.label = label;
  }
  return result;
};

export const image = (assetId: string, layer: string, options: KeyValuePair[]): core.Image => {
  const config = layerConfig(layer, options);
  delete config.tag;
  const result: core.Image = {
    tag: core.Tag.image,
    layer: config,
    assetId: assetId
  };
  return result;
};

export const text = (values: (string | core.Ruby[])[], cm: any): core.Text => {
  const result: core.Text = {
    tag: core.Tag.text,
    values: values
  };
  if (cm) {
    result.clear = true;
  }
  return result;
};

const flatten = (
  result: (string | core.Ruby[] | core.Variable)[],
  text: string,
  values: (string | core.Ruby[] | core.Variable)[]
) => {
  for (const v of values) {
    if (Array.isArray(v)) {
      if (text) {
        result.push(text);
        text = "";
      }
      result.push(v);
    } else if (typeof v === "string") {
      text += v;
    } else {
      if (text) {
        result.push(text);
        text = "";
      }
      result.push(v);
    }
  }
  return text;
};

export const textBlock = (
  t: (string | core.Ruby[] | core.Variable)[],
  ts: (string | core.Ruby[] | core.Variable)[][]
): (string | core.Ruby[] | core.Variable)[] => {
  const result: (string | core.Ruby[] | core.Variable)[] = [];
  let text = flatten(result, "", t);
  for (const t of ts) {
    text = flatten(result, text, t);
  }
  if (text) {
    result.push(text);
  }
  return result;
};

export const textLine = (
  values: (string | core.Ruby[] | core.Variable)[],
  top: any,
  end: any
): (string | core.Ruby[] | core.Variable)[] => {
  if (top) {
    if (typeof values[0] === "string") {
      values[0] = "\n" + values[0];
    } else {
      values = (["\n"] as (string | core.Ruby[] | core.Variable)[]).concat(values);
    }
  }
  if (end) {
    var last = values[values.length - 1];
    if (typeof last === "string") {
      values[values.length - 1] = last + "\n";
    } else {
      values.push("\n");
    }
  }
  const result: (string | core.Ruby[] | core.Variable)[] = [];
  let text = flatten(result, "", values);
  if (text) {
    result.push(text);
  }
  return result;
};

export const ruby = (rb: string, rt: string): core.Ruby[] => {
  return [
    {
      value: JSON.stringify({
        rb: rb,
        rt: rt
      })
    }
  ];
};

const varSf = "sf";
const varF = "f";

export const variable = (expression: string): core.Variable => {
  let value: core.Variable | undefined;
  estraverse.traverse(acorn.parse(expression) as estree.Node, {
    enter: (node: estree.Node): estraverse.VisitorOption | estree.Node | void => {
      if (node.type === "Program" && node.body.length === 1) {
        const statement = node.body[0];
        if (statement.type === "ExpressionStatement") {
          const e = statement.expression;
          if (e.type === "MemberExpression" && e.object.type === "Identifier" && e.property.type === "Identifier") {
            switch (e.object.name) {
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
            return estraverse.VisitorOption.Break;
          }
        }
      }
    }
  });
  if (value) {
    return value;
  } else {
    throw new Error(`illegal expression(call variable): ${expression}`);
  }
};

export const playAudio = (assetId: string, group: string): core.PlayAudio => {
  return {
    tag: core.Tag.playAudio,
    assetId: assetId,
    group
  };
};

export const stopAudio = (group: string): core.StopAudio => {
  return {
    tag: core.Tag.stopAudio,
    group
  };
};

export const tryParseLiteral = (value: string) => {
  let parsed: any = parseInt(value, 10);
  if (isNaN(parsed)) {
    parsed = parseFloat(value);
  }
  if (isNaN(parsed)) {
    if (value === "true") {
      parsed = true;
    } else if (value === "false") {
      parsed = false;
    } else {
      parsed = value;
    }
  }
  return parsed;
};

export const tag = (name: string, attrs: KeyValuePair[]): core.Script => {
  const result: core.Extension = {
    tag: core.Tag.extension,
    data: {
      tag: name
    }
  };
  for (const attr of attrs) {
    (result.data as any)[attr.key] = tryParseLiteral(attr.value);
  }
  switch (name) {
    case core.Tag.fadeIn:
    case core.Tag.fadeOut:
      result.data.after = [];
      return result.data as core.Fade;
  }
  return result;
};

const MemberExpression = "MemberExpression";
const Identifier = "Identifier";

const newMemberExpression = (name: string): estree.MemberExpression => {
  return {
    type: MemberExpression,
    object: {
      type: Identifier,
      name: "variables"
    },
    property: {
      type: Identifier,
      name
    },
    computed: false
  };
};

const replaceVariable = (node: estree.MemberExpression) => {
  const object = node.object;
  if (object.type === Identifier) {
    switch (object.name) {
      case varSf:
        node.object = newMemberExpression(core.VariableType.system);
        break;
      case varF:
        node.object = newMemberExpression(core.VariableType.current);
        break;
      default:
        break;
    }
  }
};

const isFirstMember = (expr: estree.MemberExpression) => {
  return expr.object.type === Identifier && expr.property.type === Identifier;
};

const traverseEval = (original: string): estree.Node => {
  return estraverse.replace(acorn.parse(original) as estree.Node, {
    leave: (node: estree.Node, parentNode: estree.Node | null) => {
      switch (node.type) {
        case MemberExpression:
          if (parentNode !== null && isFirstMember(node)) {
            replaceVariable(node);
          }
          break;
        default:
          break;
      }
      // FIXME: acornでstartとendを削除する方法を探す
      const n = node as any;
      if (typeof n.start === "number") {
        delete n["start"];
      }
      if (typeof n.end === "number") {
        delete n["end"];
      }
    }
  });
};

export const evaluate = (expression: string): ast.Eval => {
  return {
    tag: core.Tag.evaluate,
    program: traverseEval(expression)
  };
};

export const condition = (expression: string, scripts: ast.Script[]): ast.Condition => {
  return {
    tag: core.Tag.condition,
    expression: traverseEval(expression),
    scripts
  };
};

export const trigger = (enabled: boolean): core.Trigger => {
  return {
    tag: core.Tag.trigger,
    value: enabled ? core.TriggerValue.On : core.TriggerValue.Off
  };
};

const pathToSceneName = (scene: string): string => {
  const full = path.relative(context.base, path.join(context.base, context.relative, scene));
  const dir = path.dirname(full);
  return path.join(dir, ast.filename(scene));
};

export const jump = (data: ast.Jump): ast.Jump => {
  if (data.scene) {
    data.scene = pathToSceneName(data.scene);
    context.dependencies.push(data.scene);
  }
  return data;
};

export const choice = (l: ast.ChoiceItem, ls: ast.ChoiceItem[]): ast.Choice => {
  return {
    tag: core.Tag.choice,
    layer: {
      name: core.LayerKind.choice
    },
    values: [l].concat(ls)
  };
};

export const choiceItem = (text: string, data: ast.Jump, condition?: string): ast.ChoiceItem => {
  if (data.scene) {
    context.dependencies.push(data.scene);
  }
  const result: ast.ChoiceItem = {
    ...jump(data),
    text
  };
  if (condition) {
    result.condition = traverseEval(condition);
  }
  return result;
};

export const layerConfig = (name: string, options: KeyValuePair[]): core.Layer => {
  const result: core.Layer = {
    tag: core.Tag.layer,
    name
  };
  for (const option of options) {
    if (option.key === "opacity") {
      option.value = option.value / 255;
    }
    (result as any)[option.key] = option.value;
  }
  return result;
};

export const click = (scripts: ast.Script[]): ast.Click => {
  return {
    tag: core.Tag.click,
    scripts
  };
};

export const clearSystemVariables = (): core.ClearSystemVariables => {
  return {
    tag: core.Tag.clearSystemVariables
  };
};

export const clearCurrentVariables = (): core.ClearCurrentVariables => {
  return {
    tag: core.Tag.clearCurrentVariables
  };
};

export const waitTransition = (scripts: ast.Script[], skippable?: boolean): ast.Script[] => {
  const result: ast.WaitTransition = {
    tag: ast.waitTransition,
    scripts
  };
  if (typeof skippable !== "undefined") {
    result.skippable = skippable;
  }
  return [result];
};

export const removeLayer = (name: string): core.RemoveLayer => {
  return {
    tag: core.Tag.removeLayer,
    name
  };
};

export const backlog = (): ast.Backlog => {
  return {
    tag: core.Tag.backlog,
    scripts: []
  };
};

export const messageSpeed = (speed: string): core.MessageSpeed => {
  return {
    tag: core.Tag.messageSpeed,
    speed: tryParseLiteral(speed)
  };
};

export const concatKeyValues = (data: any, options: KeyValuePair[]) => {
  for (const option of options) {
    data[option.key] = option.key === "color" ? option.value : tryParseLiteral(option.value);
  }
};

export const ignore = (expression: string, scripts: ast.Script[]): ast.Condition => {
  return condition(`!(${expression})`, scripts);
};

export const realTimeDisplay = (enabled: boolean): core.RealTimeDisplay => {
  return {
    tag: core.Tag.realTimeDisplay,
    enabled
  };
};
