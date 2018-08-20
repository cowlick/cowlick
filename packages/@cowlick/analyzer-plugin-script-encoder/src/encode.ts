import * as estree from "estree";
import {generate} from "escodegen";
import * as estraverse from "estraverse";
import {serializer} from "./serializer";

export interface Scene {
  label: string;
  source: estree.Node;
}

function literal(value: string): estree.Literal {
  return {
    type: "Literal",
    value,
    raw: JSON.stringify(value)
  };
}

const encodedPackage: estree.Identifier = {
  type: "Identifier",
  name: "encoded"
};

const encodedPackageName = "@cowlick/encoded-frame";
const importEncodedFrame: estree.VariableDeclaration = {
  type: "VariableDeclaration",
  kind: "var",
  declarations: [
    {
      type: "VariableDeclarator",
      id: encodedPackage,
      init: {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "require"
        },
        arguments: [
          {
            type: "Literal",
            value: encodedPackageName,
            raw: JSON.stringify(encodedPackageName)
          }
        ]
      }
    }
  ]
};

function quoteKeys(node: estree.ObjectExpression): estree.Node {
  const properties: estree.Property[] = node.properties.map(p => {
    if (p.key.type === "Identifier") {
      return {
        ...p,
        key: literal(p.key.name)
      };
    } else {
      return p;
    }
  });
  return {
    ...node,
    properties
  };
}

function encodeScripts(args: any): estree.Literal[] {
  let arg = args[0];
  if (arg.type === "ArrayExpression") {
    arg = {
      ...arg,
      elements: (arg as estree.ArrayExpression).elements.map(e => {
        return estraverse.replace(e, {
          leave: (node, _) => {
            if (node.type === "ObjectExpression") {
              return quoteKeys(node);
            } else {
              return node;
            }
          }
        });
      })
    };
  }
  const value = serializer
    .encode(
      JSON.parse(
        generate(arg, {
          format: {
            json: true
          }
        })
      )
    )
    .toString("base64");
  return [literal(value)];
}

function repalceFrame(node: estree.NewExpression): estree.Node {
  const callee = node.callee;
  if (callee.type === "MemberExpression") {
    const property = callee.property;
    if (property.type === "Identifier" && property.name === "Frame") {
      return {
        ...node,
        callee: {
          ...callee,
          object: encodedPackage,
          property: {
            type: "Identifier",
            name: "EncodedFrame"
          }
        },
        arguments: encodeScripts(node.arguments)
      };
    }
  }
  return node;
}

export function encode(scenes: Scene[]): Scene[] {
  return scenes.map(scene => ({
    label: scene.label,
    source: estraverse.replace(scene.source, {
      leave: (node, _) => {
        if (node.type === "Program") {
          const body = node.body.slice();
          body.unshift(importEncodedFrame);
          return {
            ...node,
            body
          };
        } else if (node.type === "NewExpression") {
          return repalceFrame(node);
        }
        return node;
      }
    })
  }));
}
