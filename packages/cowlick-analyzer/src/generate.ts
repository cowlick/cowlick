"use strict";
import {Program} from "estree";
import * as escodegen from "escodegen";
import {Scenario} from "./ast";
import {writeFile} from "./file";

export async function generate(target: string, scenario: Program) {
  return await writeFile(target, escodegen.generate(scenario));
}
