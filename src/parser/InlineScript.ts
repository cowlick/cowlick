"use strict";
import {Program} from "estree";
import * as escodegen from "escodegen";
import * as fs from "fs";
import * as path from "path";

export interface InlineScriptParameters {
  scene: string;
  frame: number;
  index: number;
  source: Program;
}

export class InlineScript {
  private scene: string;
  private frame: number;
  private index: number;
  source: Program;

  constructor(params: InlineScriptParameters) {
    this.scene = params.scene;
    this.frame = params.frame;
    this.index = params.index;
    this.source = params.source;
  }

  get name(): string {
    return `${this.scene}_${this.frame}_${this.index}.js`;
  }

  generate(): string {
    return escodegen.generate(this.source);
  }

  write(basePath: string) {
    fs.writeFileSync(path.join(basePath, this.name), this.generate());
  }
}
