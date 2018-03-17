"use strict";
import {join, dirname} from "path";
import * as escodegen from "escodegen";
import {mkdir, writeFile} from "./file";
import {GeneratedScene} from "./analyzer";

export async function generate(targetDir: string, scenario: GeneratedScene[]) {
  for (const scene of scenario) {
    const target = join(targetDir, `${scene.label}.js`);
    try {
      await mkdir(dirname(target));
    } catch (e) {
      if (e.code !== "EEXIST") {
        throw e;
      }
    }
    await writeFile(target, escodegen.generate(scene.source));
  }
}
