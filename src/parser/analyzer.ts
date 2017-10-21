"use strict";
import * as estree from "estree";
import * as estraverse from "estraverse";
import * as script from "../models/Script";
import {filename} from "./util";
import * as ast from "./ast";
import {InlineScript} from "./InlineScript";
import {Tag} from "../Constant";

export interface Result {
  scenario: estree.Program;
  scripts: InlineScript[];
}

type ReplaceLabel = (expression: estree.ObjectExpression, scene: string, frame: string) => void;

interface State {
  replaces: ((f: ReplaceLabel) => void)[];
  scripts: InlineScript[];
  indexes: LabelIndex[];
}

interface LabelIndex {
  scene: string;
  frame: string;
  index: number;
}

interface VisitorOptions {
  scene: string;
  frame: number;
  indexes: number[];
  state: State;
}

const Program = "Program";
const ExpressionStatement = "ExpressionStatement";
const AssignmentExpression = "AssignmentExpression";
const MemberExpression = "MemberExpression";
const Identifier = "Identifier";
const ObjectExpression = "ObjectExpression";
const NewExpression = "NewExpression";
const ArrayExpression = "ArrayExpression";
const ReturnStatement = "ReturnStatement";
const ImportDeclaration = "ImportDeclaration";
const ImportSpecifier = "ImportSpecifier";
const Property = "Property";
const Literal = "Literal";

const Scenario: estree.Identifier = {
  type: Identifier,
  name: "Scenario"
};
const Scene: estree.Identifier = {
  type: Identifier,
  name: "Scene"
};
const Frame: estree.Identifier = {
  type: Identifier,
  name: "Frame"
};

function program(body: (estree.Statement | estree.ModuleDeclaration)[]): estree.Program {
  return {
    type: Program,
    body,
    sourceType: "module"
  };
}

function moduleExports(right: estree.Expression): estree.ExpressionStatement {
  return {
    type: ExpressionStatement,
    expression: {
      type: AssignmentExpression,
      operator: "=",
      left: {
        type: MemberExpression,
        object: {
          type: Identifier,
          name: "module"
        },
        property: {
          type: Identifier,
          name: "exports"
        },
        computed: false
      },
      right
    }
  };
}

function object(properties: estree.Property[]): estree.ObjectExpression {
  return {
    type: ObjectExpression,
    properties
  };
}

function property(name: string, value: estree.Expression): estree.Property {
  return {
    type: Property,
    method: false,
    shorthand: false,
    computed: false,
    kind: "init",
    key: {
      type: Identifier,
      name
    },
    value
  };
}

function literal(value: any): estree.Literal {
  let raw: string;
  if(typeof value === "string") {
    raw = JSON.stringify(value);
  } else {
    raw = String(value);
  }
  return {
    type: Literal,
    value,
    raw
  };
}

function scriptAst(tag: string, data: estree.Property[]): estree.ObjectExpression {
  return object([
    property("tag", literal(tag)),
    property("data", object(data))
  ]);
}

function name(value: string): estree.Property {
  return property("name", literal(value));
}

function text(original: script.Text): estree.ObjectExpression {
  const data: estree.Property[] = [];
  if(original.clear) {
    data.push(property("clear", literal(original.clear)));
  }
  const values: estree.Expression[] = [];
  for(const value of original.values) {
    if(typeof value === "string") {
      values.push(literal(value));
    } else if(Array.isArray(value)) {
      values.push({
        type: ArrayExpression,
        elements: value.map(v => object([property("value", literal(v.value))]))
      });
    } else {
      values.push(
        object([
          property("type", literal(value.type)),
          name(value.name)
        ])
      );
    }
  }
  data.push(property("values", { type: ArrayExpression, elements: values }));
  return scriptAst(Tag.text, data);
}

function assetId(id: string): estree.Property {
  return property("assetId", literal(id));
}

function layerConfig(config: script.LayerConfig): estree.Property[] {
  const ps: estree.Property[] = [name(config.name)];
  if(typeof config.x !== "undefined") {
    ps.push(property("x", literal(config.x)));
  }
  if(typeof config.y !== "undefined") {
    ps.push(property("y", literal(config.y)));
  }
  if(typeof config.opacity !== "undefined") {
    ps.push(property("opacity", literal(config.opacity)));
  }
  if(typeof config.visible !== "undefined") {
    ps.push(property("visible", literal(config.visible)));
  }
  return ps;
}

function layerProperty(config: script.LayerConfig): estree.Property {
  return property("layer", object(layerConfig(config)));
}

function image(original: script.Image): estree.ObjectExpression {
  return scriptAst(Tag.image, [assetId(original.assetId), layerProperty(original.layer)]);
}

function audio(original: script.Script<script.Audio>): estree.ObjectExpression {
  return scriptAst(original.tag, [assetId(original.data.assetId), property("group", literal(original.data.group))]);
}

function nestOptions(options: VisitorOptions, i: number): VisitorOptions {
  return {
    scene: options.scene,
    frame: options.frame,
    indexes: options.indexes.concat(i),
    state: options.state
  };
}

function click(original: script.Script<any>[], options: VisitorOptions): estree.ObjectExpression {
  return object([
    property("tag", literal(Tag.click)),
    property(
      "data",
      {
        type: ArrayExpression,
        elements: original.map((s, i) => visit(s, nestOptions(options, i)))
      }
    )
  ]);
}

function programToExportFunction(original: estree.Program, requireReturn: boolean) {
  const body: estree.Statement[] = [];
  let index = 0;
  for(const b of original.body) {
    switch(b.type) {
      case ExpressionStatement:
        if(requireReturn && index + 1 === original.body.length) {
          body.push({
            type: ReturnStatement,
            argument: b.expression
          });
        } else {
          body.push(b);
        }
        break;
      case "BlockStatement":
      case "EmptyStatement":
      case "DebuggerStatement":
      case "WithStatement":
      case ReturnStatement:
      case "LabeledStatement":
      case "BreakStatement":
      case "ContinueStatement":
      case "IfStatement":
      case "SwitchStatement":
      case "ThrowStatement":
      case "TryStatement":
      case "WhileStatement":
      case "DoWhileStatement":
      case "ForStatement":
      case "ForInStatement":
      case "ForOfStatement":
        body.push(b);
        break;
      default:
        throw new Error(`unexpected statement: ${JSON.stringify(b)}`);
    }
    index++;
  }
  return moduleExports({
    type: "FunctionExpression",
    id: null,
    expression: false,
    generator: false,
    async: false,
    params: [
      {
        type: Identifier,
        name: "variables"
      }
    ],
    body: {
      type: "BlockStatement",
      body
    }
  });
}

function exportFunction(original: estree.Program, requireReturn: boolean) {
  return estraverse.replace(original, {
    leave: (node, path) => {
      switch(node.type) {
        case Program:
          node.body = [programToExportFunction(node, requireReturn)];
          node.sourceType = "module";
          break;
        default:
          break;
      }
    }
  });
}

function evaluate(original: estree.Program, options: VisitorOptions): estree.ObjectExpression {
  const s = new InlineScript({
    scene: options.scene,
    frame: options.frame,
    indexes: options.indexes,
    source: exportFunction(original, false)
  });
  options.state.scripts.push(s);
  return scriptAst(Tag.evaluate, [property("path", literal(s.assetId))]);
}

function condition(original: ast.Condition, options: VisitorOptions): estree.ObjectExpression {
  const s = new InlineScript({
    scene: options.scene,
    frame: options.frame,
    indexes: options.indexes,
    source: exportFunction(original.expression, true)
  });
  options.state.scripts.push(s);
  return scriptAst(
    Tag.condition,
    [
      property("path", literal(s.assetId)),
      property(
        "scripts",
        {
          type: ArrayExpression,
          elements: original.scripts.map((s, i) => visit(s, nestOptions(options, i)))
        }
      )
    ]
  );
}

function jump(original: ast.Jump, options: VisitorOptions): estree.ObjectExpression {
  const label = original.scene ? filename(original.scene) : options.scene;
  const data = object([property("label", literal(label))]);
  const result = object([
    property("tag", literal(Tag.jump)),
    property("data", data)
  ]);
  if(original.frame) {
    options.state.replaces.push(f => f(data, label, original.frame));
  }
  return result;
}

function choiceItem(value: ast.ChoiceItem, options: VisitorOptions): estree.ObjectExpression {
  const result = jump(value.data, options);
  result.properties.push(property("text", literal(value.text)));
  if(value.condition) {
    const s = new InlineScript({
      scene: options.scene,
      frame: options.frame,
      indexes: options.indexes,
      source: exportFunction(value.condition, true)
    });
    options.state.scripts.push(s);
    result.properties.push(property("path", literal(s.assetId)));
  }
  return result;
}

function choice(original: ast.Choice, options: VisitorOptions): estree.ObjectExpression {
  return scriptAst(
    Tag.choice,
    [
      layerProperty(original.layer),
      property(
        "values",
        {
          type: ArrayExpression,
          elements: original.values.map((v, i) => choiceItem(v, nestOptions(options, i)))
        }
      )
    ]
  );
}

function timeout(original: script.Timeout, options: VisitorOptions): estree.ObjectExpression {
  return scriptAst(
    Tag.timeout,
    [
      property("milliseconds", literal(original.milliseconds)),
      property(
        "scripts",
        {
          type: ArrayExpression,
          elements: original.scripts.map((s, i) => visit(s, nestOptions(options, i)))
        }
      )
    ]
  );
}

function userDefined(original: script.Script<any>): estree.ObjectExpression {
  const ps: estree.Property[] = [];
  for(const key of Object.keys(original.data)) {
    // TODO: リテラル以外のデータを解析できるようにする
    const value = literal(original.data[key]);
    ps.push(property(key, value));
  }
  return scriptAst(original.tag, ps);
}

function visit(original: script.Script<any>, options: VisitorOptions): estree.ObjectExpression {
  switch(original.tag) {
    case Tag.text:
      return text(original.data);
    case Tag.image:
      return image(original.data);
    case Tag.layerConfig:
      return scriptAst(Tag.layerConfig, layerConfig(original.data));
    case Tag.playAudio:
    case Tag.stopAudio:
      return audio(original);
    case Tag.click:
      return click(original.data, options);
    case Tag.evaluate:
      return evaluate(original.data, options);
    case Tag.condition:
      return condition(original.data, options);
    case Tag.jump:
      return jump(original.data, options);
    case Tag.choice:
      return choice(original.data, options);
    case Tag.timeout:
      return timeout(original.data, options);
    default:
      return userDefined(original);
  }
}

function frame(original: ast.Frame, scene: string, index: number, state: State): estree.NewExpression {
  const result: estree.NewExpression = {
    type: NewExpression,
    callee: Frame,
    arguments: [
      {
        type: ArrayExpression,
        elements: original.scripts.map((s, i) => visit(s, { scene, frame: index, indexes: [i], state }))
      }
    ]
  };
  if(original.label) {
    state.indexes.push({
      scene,
      frame: original.label,
      index
    });
  }
  return result;
}

function scene(original: ast.Scene, state: State): estree.NewExpression {
  return {
    type: NewExpression,
    callee: Scene,
    arguments: [
      object([
        property("label", literal(original.label)),
        property(
          "frames",
          {
            type: ArrayExpression,
            elements: original.frames.map((f, i) => frame(f, original.label, i, state))
          }
        )
      ])
    ]
  };
}

const importCowlick: estree.ImportDeclaration = {
  type: ImportDeclaration,
  specifiers: [
    {
      type: ImportSpecifier,
      imported: Scenario,
      local: Scenario
    },
    {
      type: ImportSpecifier,
      imported: Scene,
      local: Scene
    },
    {
      type: ImportSpecifier,
      imported: Frame,
      local: Frame
    }
  ],
  source: literal("cowlick")
};

function scenario(original: ast.Scenario, state: State): estree.Program {
  const result: estree.NewExpression = {
    type: NewExpression,
    callee: Scenario,
    arguments: [
      {
        type: ArrayExpression,
        elements: original.map(s => scene(s, state))
      }
    ]
  };
  return program([importCowlick, moduleExports(result)]);
}

export function analyze(original: ast.Scenario): Result {
  const state: State = {
    replaces: [],
    scripts: [],
    indexes: []
  };
  const result = scenario(original, state);
  for(const replace of state.replaces) {
    replace((expression, scene, frame) => {
      const i = state.indexes.find(i => i.scene === scene && i.frame === frame);
      if(i) {
        expression.properties.push(property("frame", literal(i.index)));
      } else {
        throw new Error(`label(scene = ${scene}, frame = ${frame}) not found.`);
      }
    });
  }
  return {
    scenario: result,
    scripts: state.scripts
  };
}
