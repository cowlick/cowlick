"use strict";
import {join} from "path";
import * as escodegen from "escodegen";
import {writeFile} from "./file";
import {GeneratedScene} from "./analyzer";

export async function generate(targetDir: string, scenario: GeneratedScene[]) {
  for (const scene of scenario) {
    await writeFile(join(targetDir, `${scene.label}.js`), escodegen.generate(scene.source));
  }
}
