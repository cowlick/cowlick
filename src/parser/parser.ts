"use strict";
import * as fs from "fs";
import * as path from "path";
import * as kag from "../../resources/kag";
import * as ast from "./ast";

export function parse(target: string, baseDir: string): ast.Scenario {
  const input = fs.readFileSync(target, "utf8");
  // TODO: プラグイン機構の導入
  const frames = kag.parse(input);
  const scene: ast.Scene = {
    label: path.basename(target, path.extname(target)),
    frames
  };
  return [scene];
}