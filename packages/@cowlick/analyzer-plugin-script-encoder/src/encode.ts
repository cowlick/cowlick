import * as estree from "estree";
import {generate} from "escodegen";
import * as estraverse from "estraverse";
import {serializer} from "./serializer";

function encodeScripts(args: any): estree.Literal[] {
  const value = serializer.encode(eval(generate(args[0]))).toString("base64");
  return [
    {
      type: "Literal",
      value,
      raw: JSON.stringify(value)
    }
  ];
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

export function encodeFrame(program: estree.Program): estree.Node {
  return estraverse.replace(program, {
    leave: (node, _) => {
      if (node.type === "Program") {
        const body = node.body.slice();
        body.unshift(importEncodedFrame);
        return {
          ...node,
          body
        };
      } else if (node.type === "NewExpression") {
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
      }
      return node;
    }
  });
}
