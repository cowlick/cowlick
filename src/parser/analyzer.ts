"use strict";
import * as estree from "estree";
import * as script from "../models/Script";
import * as ast from "./ast";
import {InlineScript} from "./InlineScript";
import {Tag} from "../Constant";

export interface Result {
  scenario: estree.Program;
  scripts: InlineScript[];
}

const ExpressionStatement = "ExpressionStatement";
const AssignmentExpression = "AssignmentExpression";
const MemberExpression = "MemberExpression";
const Identifier = "Identifier";
const ObjectExpression = "ObjectExpression";
const NewExpression = "NewExpression";
const ArrayExpression = "ArrayExpression";
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
    type: "Program",
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

function layerConfig(config: script.LayerConfig): estree.Property {
  const ps: estree.Property[] = [name(config.name)];
  if(config.opacity) {
    ps.push(property("opacity", literal(config.opacity)));
  }
  if(config.visible) {
    ps.push(property("visible", literal(config.visible)));
  }
  if(typeof config.x !== "undefined") {
    ps.push(property("x", literal(config.x)));
  }
  if(typeof config.y !== "undefined") {
    ps.push(property("y", literal(config.y)));
  }
  return property("layer", object(ps));
}

function image(original: script.Image): estree.ObjectExpression {
  return scriptAst(Tag.image, [assetId(original.assetId), layerConfig(original.layer)]);
}

function visit(scene: string, index: number, original: script.Script<any>, scripts: InlineScript[]): estree.ObjectExpression {
  switch(original.tag) {
    case Tag.text:
      return text(original.data);
    case Tag.image:
      return image(original.data);
    // TODO: ユーザ定義スクリプトとして生成する
    default:
      throw new Error("not implemented!");
  }
}

function frame(scene: string, original: ast.Frame, scripts: InlineScript[]): estree.NewExpression {
  return {
    type: NewExpression,
    callee: Frame,
    arguments: [
      {
        type: ArrayExpression,
        elements: original.scripts.map((s, i) => visit(scene, i, s, scripts))
      }
    ]
  };
}

function scene(original: ast.Scene, scripts: InlineScript[]): estree.NewExpression {
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
            elements: original.frames.map(f => frame(original.label, f, scripts))
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

function scenario(original: ast.Scenario, scripts: InlineScript[]): estree.Program {
  const result: estree.NewExpression = {
    type: NewExpression,
    callee: Scenario,
    arguments: [
      {
        type: ArrayExpression,
        elements: original.map(s => scene(s, scripts))
      }
    ]
  };
  return program([importCowlick, moduleExports(result)]);
}

export function analyze(original: ast.Scenario): Result {
  const scripts: InlineScript[] = [];
  const result = scenario(original, scripts);
  return {
    scenario: result,
    scripts
  };
}
