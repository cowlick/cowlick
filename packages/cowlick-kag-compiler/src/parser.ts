"use strict";
import * as path from "path";
import * as analyzer from "cowlick-analyzer";
import * as kag from "../resources/kag";
import {Run} from "./runner";

interface ParseResult {
  scene: analyzer.Scene;
  dependencies: string[];
}

async function parseScene(target: string, run: Run<kag.Result>): Promise<ParseResult> {
  const input = await analyzer.readFile(target, "utf8");
  const result = await run(`Parsing ${target}`, async () => kag.parse(input));
  const scene: analyzer.Scene = {
    label: analyzer.filename(target),
    frames: result.frames
  };
  return {
    scene,
    dependencies: result.dependencies
  };
}

export async function parse(baseDir: string, run: Run<kag.Result>): Promise<analyzer.Scenario> {
  let targets = ["first.ks"];
  const scenario: analyzer.Scene[] = [];
  while (targets.length !== 0) {
    const filePath = path.resolve(baseDir, targets.pop());
    const result = await parseScene(filePath, run);
    scenario.push(result.scene);

    // ファイル登場順に1度だけ解析対象として追加する
    for (const d of result.dependencies) {
      if (targets.some(t => t === d) === false && scenario.some(s => s.label === analyzer.filename(d)) === false) {
        targets.push(d);
      }
    }
  }
  return scenario;
}
