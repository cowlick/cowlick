"use strict";
import * as path from "path";
import * as analyzer from "@cowlick/analyzer";
import * as kag from "../resources/kag";
import {Run} from "./runner";

interface ParseResult {
  scene: analyzer.Scene;
  dependencies: string[];
}

async function parseScene(target: string, baseDir: string, run: Run<kag.Result>): Promise<ParseResult> {
  const relative = path.dirname(target);
  let filePath = path.join(baseDir, target);
  if (path.extname(filePath) === "") {
    filePath = filePath + ".ks";
  }
  const input = await analyzer.readFile(filePath, "utf8");
  const result = await run(`Parsing ${target}`, async () => kag.parse(input, {base: baseDir, relative}));
  const scene: analyzer.Scene = {
    label: analyzer.filename(target),
    frames: result.frames
  };
  return {
    scene,
    dependencies: result.dependencies
  };
}

export async function parse(first: string, run: Run<kag.Result>): Promise<analyzer.Scenario> {
  const baseDir = path.dirname(first);
  let targets = [path.basename(first)];
  let target: string | undefined = path.basename(first);
  const scenario: analyzer.Scene[] = [];
  while (target) {
    const result = await parseScene(target, baseDir, run);
    scenario.push(result.scene);

    // ファイル登場順に1度だけ解析対象として追加する
    for (const d of result.dependencies) {
      if ((targets.some(t => t === d) || scenario.some(s => s.label === d)) === false) {
        targets.push(d);
      }
    }

    target = targets.pop();
  }
  return scenario;
}
