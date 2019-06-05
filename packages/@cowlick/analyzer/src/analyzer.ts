import * as estree from "estree";
import * as estraverse from "estraverse";
import * as core from "@cowlick/core";
import * as Tag from "./constant";
import * as ast from "./ast";
import {InlineScript} from "./InlineScript";
import {Plugin} from "./Plugin";

/**
 * 生成されたシーン
 */
export interface GeneratedScene {
  /**
   * シーン名
   */
  label: string;
  /**
   * シーンソース
   */
  source: estree.Program;
}

/**
 * 解析結果
 */
export interface Result {
  /**
   * シナリオ
   */
  scenario: GeneratedScene[];
  /**
   * 埋め込みスクリプト
   */
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
const Property = "Property";
const Literal = "Literal";

const corePackage: estree.Identifier = {
  type: Identifier,
  name: "core"
};

const Scene: estree.MemberExpression = {
  type: MemberExpression,
  object: corePackage,
  property: {
    type: Identifier,
    name: "Scene"
  },
  computed: false
};
const Frame: estree.MemberExpression = {
  type: MemberExpression,
  object: corePackage,
  property: {
    type: Identifier,
    name: "Frame"
  },
  computed: false
};

const program = (body: (estree.Statement | estree.ModuleDeclaration)[]): estree.Program => {
  return {
    type: Program,
    body,
    sourceType: "module"
  };
};

const moduleExports = (right: estree.Expression): estree.ExpressionStatement => {
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
};

const object = (properties: estree.Property[]): estree.ObjectExpression => {
  return {
    type: ObjectExpression,
    properties
  };
};

const property = (name: string, value: estree.Expression): estree.Property => {
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
};

const literal = (value: any): estree.Expression => {
  let raw: string;
  if (typeof value === "string") {
    raw = JSON.stringify(value);
  } else if (Array.isArray(value)) {
    return {
      type: ArrayExpression,
      elements: value
    };
  } else {
    raw = String(value);
  }
  return {
    type: Literal,
    value,
    raw
  };
};

const scriptAst = (tag: string, data: estree.Property[]): estree.ObjectExpression => {
  return object([property("tag", literal(tag)), ...data]);
};

const name = (value: string): estree.Property => {
  return property("name", literal(value));
};

const text = (original: core.Text): estree.ObjectExpression => {
  const data: estree.Property[] = [];
  if (original.clear) {
    data.push(property("clear", literal(original.clear)));
  }
  const values: estree.Expression[] = [];
  for (const value of original.values) {
    if (typeof value === "string") {
      values.push(literal(value));
    } else if (Array.isArray(value)) {
      values.push({
        type: ArrayExpression,
        elements: value.map(v => object([property("value", literal(v.value))]))
      });
    } else {
      values.push(object([property("type", literal(value.type)), name(value.name)]));
    }
  }
  data.push(property("values", {type: ArrayExpression, elements: values}));
  return scriptAst(core.Tag.text, data);
};

const assetId = (id: string): estree.Property => {
  return property("assetId", literal(id));
};

const layerConfig = (config: core.LayerConfig): estree.Property[] => {
  const ps: estree.Property[] = [name(config.name)];
  if ("x" in config) {
    ps.push(property("x", literal(config.x)));
  }
  if ("y" in config) {
    ps.push(property("y", literal(config.y)));
  }
  if ("opacity" in config) {
    ps.push(property("opacity", literal(config.opacity)));
  }
  if ("visible" in config) {
    ps.push(property("visible", literal(config.visible)));
  }
  return ps;
};

const layerProperty = (config: core.LayerConfig): estree.Property => {
  return property("layer", object(layerConfig(config)));
};

const imageProperties = (original: core.Image): estree.Property[] => {
  return [assetId(original.assetId), layerProperty(original.layer)];
};

const image = (original: core.Image): estree.ObjectExpression => {
  return scriptAst(original.tag, imageProperties(original));
};

const nestOptions = (options: VisitorOptions, i: number): VisitorOptions => {
  return {
    scene: options.scene,
    frame: options.frame,
    indexes: options.indexes.concat(i),
    state: options.state
  };
};

const click = (original: ast.Script[], options: VisitorOptions): estree.ObjectExpression => {
  return scriptAst(core.Tag.click, [
    property("scripts", {
      type: ArrayExpression,
      elements: visitScripts(original, options, 0)
    })
  ]);
};

const programToExportFunction = (original: estree.Program, requireReturn: boolean) => {
  const body: estree.Statement[] = [];
  let index = 0;
  for (const b of original.body) {
    switch (b.type) {
      case ExpressionStatement:
        if (requireReturn && index + 1 === original.body.length) {
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
  // FIXME: esprimaでのexpressionプロパティが付与される動作に合わせるため、anyに型変換する
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
  } as any);
};

const exportFunction = (original: estree.Node, requireReturn: boolean) => {
  return estraverse.replace(original, {
    leave: (node, _) => {
      switch (node.type) {
        case Program:
          node.body = [programToExportFunction(node, requireReturn)];
          node.sourceType = "module";
          break;
        default:
          break;
      }
    }
  });
};

const evaluate = (original: estree.Node, options: VisitorOptions): estree.ObjectExpression => {
  const s = new InlineScript({
    scene: options.scene,
    frame: options.frame,
    indexes: options.indexes,
    source: exportFunction(original, false)
  });
  options.state.scripts.push(s);
  return scriptAst(core.Tag.evaluate, [property("path", literal(s.assetId))]);
};

const conditionBody = (is: InlineScript, scripts: ast.Script[], options: VisitorOptions): estree.Property[] => {
  return [
    property("path", literal(is.assetId)),
    property("scripts", {
      type: ArrayExpression,
      elements: visitScripts(scripts, options, 0)
    })
  ];
};

const createInlineScript = (expression: estree.Node, options: VisitorOptions) => {
  const is = new InlineScript({
    scene: options.scene,
    frame: options.frame,
    indexes: options.indexes,
    source: exportFunction(expression, true)
  });
  options.state.scripts.push(is);
  return is;
};

const condition = (original: ast.Condition, options: VisitorOptions): estree.ObjectExpression => {
  const is = createInlineScript(original.expression, options);
  return scriptAst(core.Tag.condition, conditionBody(is, original.scripts, options));
};

const jump = (original: ast.Jump, options: VisitorOptions): estree.ObjectExpression => {
  let label: string = options.scene;
  if (original.scene) {
    label = original.scene;
  }
  const result = object([property("tag", literal(core.Tag.jump)), property("label", literal(label))]);
  if (original.frame) {
    const frame: string = original.frame;
    options.state.replaces.push(f => f(result, label, frame));
  }
  return result;
};

const choiceItem = (value: ast.ChoiceItem, options: VisitorOptions): estree.ObjectExpression => {
  const result = jump(value, options);
  result.properties.push(property("text", literal(value.text)));
  if (value.condition) {
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
};

const choice = (original: ast.Choice, options: VisitorOptions): estree.ObjectExpression => {
  return scriptAst(core.Tag.choice, [
    layerProperty(original.layer),
    property("values", {
      type: ArrayExpression,
      elements: original.values.map((v, i) => choiceItem(v, nestOptions(options, i)))
    })
  ]);
};

const timeout = (original: ast.Timeout, options: VisitorOptions): estree.ObjectExpression => {
  return scriptAst(core.Tag.timeout, [
    property("milliseconds", literal(original.milliseconds)),
    property("scripts", {
      type: ArrayExpression,
      elements: visitScripts(original.scripts, options, 0)
    })
  ]);
};

const ifElse = (original: ast.IfElse, options: VisitorOptions): estree.ObjectExpression => {
  const l = original.conditions.length;
  return scriptAst(core.Tag.ifElse, [
    property("conditions", {
      type: ArrayExpression,
      elements: original.conditions.map((c, i) => {
        const nested = nestOptions(options, i);
        const is = createInlineScript(c.expression, nested);
        return object(conditionBody(is, c.scripts, nested));
      })
    }),
    property("elseBody", {
      type: ArrayExpression,
      elements: visitScripts(original.elseBody, options, l)
    })
  ]);
};

const waitTransition = (original: ast.WaitTransition, options: VisitorOptions): estree.ObjectExpression[] => {
  let scripts = visitScripts(original.scripts, options, 0);
  if (!!original.skippable) {
    scripts.push(
      click(
        [
          {
            tag: core.Tag.skip
          }
        ],
        options
      )
    );
  }
  return scripts;
};

const button = (original: ast.Button, options: VisitorOptions): estree.ObjectExpression => {
  return scriptAst(core.Tag.button, [
    property("image", object(imageProperties(original.image))),
    property("scripts", {
      type: ArrayExpression,
      elements: visitScripts(original.scripts, options, 0)
    })
  ]);
};

const flatObjectToAST = (original: any): estree.ObjectExpression => {
  return object(Object.entries(original).map(([k, v]) => property(k, literal(v))));
};

const backlog = (original: ast.Backlog, options: VisitorOptions): estree.ObjectExpression => {
  return scriptAst(core.Tag.backlog, [
    property("scripts", {
      type: ArrayExpression,
      elements: visitScripts(original.scripts, options, 0)
    })
  ]);
};

const paneProperties = (original: core.PaneDefinition): estree.Property[] => {
  const ps: estree.Property[] = [layerProperty(original.layer)];
  if ("width" in original) {
    ps.push(property("width", literal(original.width)));
  }
  if ("height" in original) {
    ps.push(property("height", literal(original.height)));
  }
  if ("backgroundImage" in original) {
    ps.push(property("backgroundImage", literal(original.backgroundImage)));
  }
  if ("padding" in original) {
    ps.push(property("padding", literal(original.padding)));
  }
  if (original.backgroundEffector) {
    const effector = original.backgroundEffector;
    if (effector.borderWidth) {
      ps.push(property("backgroundEffector", object([property("borderWidth", literal(effector.borderWidth))])));
    }
  }
  if ("touchable" in original) {
    ps.push(property("touchable", literal(original.touchable)));
  }
  return ps;
};

const pane = (original: core.Pane): estree.ObjectExpression => {
  return scriptAst(core.Tag.pane, paneProperties(original));
};

const link = (original: ast.Link, options: VisitorOptions): estree.ObjectExpression => {
  const ps: estree.Property[] = [
    ...paneProperties(original),
    property("text", literal(original.text)),
    property("scripts", {
      type: ArrayExpression,
      elements: visitScripts(original.scripts, options, 0)
    })
  ];
  if ("fontSize" in original) {
    ps.push(property("fontSize", literal(original.fontSize)));
  }
  return scriptAst(core.Tag.button, ps);
};

const userDefined = (original: any): estree.ObjectExpression => {
  const ps: estree.Property[] = [];
  for (const key of Object.keys(original)) {
    // TODO: リテラル以外のデータを解析できるようにする
    const value = literal(original[key]);
    ps.push(property(key, value));
  }
  return scriptAst(core.Tag.extension, [property("data", object(ps))]);
};

const visitScripts = (scripts: ast.Script[], options: VisitorOptions, l: number) => {
  const result: estree.ObjectExpression[] = [];
  for (const [i, s] of scripts.entries()) {
    result.push(...visit(s, nestOptions(options, l + i)));
  }
  return result;
};

const visit = (original: ast.Script, options: VisitorOptions): estree.ObjectExpression[] => {
  switch (original.tag) {
    case core.Tag.text:
      return [text(original)];
    case core.Tag.pane:
      return [pane(original)];
    case core.Tag.image:
    case core.Tag.frameImage:
      return [image(original)];
    case core.Tag.layer:
      return [scriptAst(core.Tag.layer, layerConfig(original))];
    case core.Tag.click:
      return [click(original.scripts, options)];
    case core.Tag.evaluate:
      return [evaluate(original.program, options)];
    case core.Tag.condition:
      return [condition(original, options)];
    case core.Tag.jump:
      return [jump(original, options)];
    case core.Tag.choice:
      return [choice(original, options)];
    case core.Tag.timeout:
      return [timeout(original, options)];
    case core.Tag.ifElse:
      return [ifElse(original, options)];
    case Tag.waitTransition:
      return waitTransition(original, options);
    case core.Tag.button:
      return [button(original, options)];
    case core.Tag.backlog:
      return [backlog(original, options)];
    case core.Tag.link:
      return [link(original, options)];
    case core.Tag.font:
    case core.Tag.playAudio:
    case core.Tag.stopAudio:
    case core.Tag.playVideo:
    case core.Tag.stopVideo:
    case core.Tag.removeLayer:
    case core.Tag.trigger:
    case core.Tag.messageSpeed:
    case core.Tag.realTimeDisplay:
    case core.Tag.skip:
    case core.Tag.save:
    case core.Tag.load:
    case core.Tag.openSaveScene:
    case core.Tag.openLoadScene:
    case core.Tag.clearSystemVariables:
    case core.Tag.clearCurrentVariables:
    case core.Tag.autoMode:
    case core.Tag.fadeIn:
    case core.Tag.fadeOut:
      return [flatObjectToAST(original)];
    case core.Tag.extension:
      return [userDefined(original.data)];
  }
  throw new Error("unknown script: " + JSON.stringify(original));
};

const frame = (original: ast.Frame, scene: string, index: number, state: State): estree.NewExpression => {
  let elements: estree.ObjectExpression[] = [];
  for (const [i, s] of original.scripts.entries()) {
    elements.push(...visit(s, {scene, frame: index, indexes: [i], state}));
  }
  const result: estree.NewExpression = {
    type: NewExpression,
    callee: Frame,
    arguments: [
      {
        type: ArrayExpression,
        elements
      }
    ]
  };
  if (original.label) {
    state.indexes.push({
      scene,
      frame: original.label,
      index
    });
  }
  return result;
};

const importCowlick: estree.VariableDeclaration = {
  type: "VariableDeclaration",
  kind: "var",
  declarations: [
    {
      type: "VariableDeclarator",
      id: corePackage,
      init: {
        type: "CallExpression",
        callee: {
          type: Identifier,
          name: "require"
        },
        arguments: [literal("@cowlick/core")]
      }
    }
  ]
};

const scene = (original: ast.Scene, state: State): estree.NewExpression => {
  return {
    type: NewExpression,
    callee: Scene,
    arguments: [
      object([
        property("label", literal(original.label)),
        property("frames", {
          type: ArrayExpression,
          elements: original.frames.map((f, i) => frame(f, original.label, i, state))
        })
      ])
    ]
  };
};

const scenario = (original: ast.Scenario, state: State): GeneratedScene[] => {
  return original.map(s => ({
    label: s.label,
    source: program([importCowlick, moduleExports(scene(s, state))])
  }));
};

const applyPlugins = async (scenes: GeneratedScene[], plugins: Plugin[], port: number) => {
  let result = scenes;
  for (const plugin of plugins) {
    result = await plugin.exec(result, port);
  }
  return result;
};

/**
 * スクリプトASTを解析してJavaScript AST形式のシナリオデータに変換する。
 *
 * @param original スクリプトAST
 * @param plugins
 * @param port pluginのport番号
 */
export const analyze = async (original: ast.Scenario, plugins: Plugin[], port: number): Promise<Result> => {
  const state: State = {
    replaces: [],
    scripts: [],
    indexes: []
  };
  const result = scenario(original, state);
  for (const replace of state.replaces) {
    replace((expression, scene, frame) => {
      const i = state.indexes.find(i => i.scene === scene && i.frame === frame);
      if (i) {
        expression.properties.push(property("frame", literal(i.index)));
      } else {
        throw new Error(`label(scene = ${scene}, frame = ${frame}) not found.`);
      }
    });
  }
  return {
    scenario: await applyPlugins(result, plugins, port),
    scripts: state.scripts
  };
};
