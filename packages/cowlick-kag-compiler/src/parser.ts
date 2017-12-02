"use strict";
import * as fs from "fs";
import * as path from "path";
import * as ast from "cowlick-analyzer";
import * as kag from "../resources/kag";

interface ParseResult {
  scene: ast.Scene;
  dependencies: string[];
}

function parseScene(target: string): ParseResult {
  const input = fs.readFileSync(target, "utf8");
  const result = kag.parse(input);
  const scene: ast.Scene = {
    label: ast.filename(target),
    frames: result.frames
  };
  return {
    scene,
    dependencies: result.dependencies
  };
}

export function parse(baseDir: string): ast.Scenario {
  let targets = ["first.ks"];
  const scenario: ast.Scene[] = [];
  while (targets.length !== 0) {
    const filePath = path.resolve(baseDir, targets.pop());
    const result = parseScene(filePath);
    scenario.push(result.scene);

    // ファイル登場順に1度だけ解析対象として追加する
    for (const d of result.dependencies) {
      if (targets.findIndex(t => t === d) === -1) {
        targets.push(d);
      }
    }
  }
  return scenario;
}
