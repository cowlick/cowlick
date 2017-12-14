"use strict";
import {Program} from "estree";
import * as escodegen from "escodegen";
import {Scenario, writeFile} from "cowlick-analyzer";

export async function generate(target: string, scenario: Program) {
  return await writeFile(target, escodegen.generate(scenario));
}
