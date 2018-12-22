import {Node} from "estree";
import * as escodegen from "escodegen";
import * as path from "path";
import {writeFile} from "./file";

export interface InlineScriptParameters {
  scene: string;
  frame: number;
  indexes: number[];
  source: Node;
}

export class InlineScript {
  private scene: string;
  private frame: number;
  private indexes: number[];
  source: Node;

  constructor(params: InlineScriptParameters) {
    this.scene = params.scene;
    this.frame = params.frame;
    this.indexes = params.indexes;
    this.source = params.source;
  }

  get assetId(): string {
    return `${this.scene}_${this.frame}_${this.indexes.join("_")}`;
  }

  get name(): string {
    return `${this.assetId}.js`;
  }

  generate(): string {
    return escodegen.generate(this.source);
  }

  write(basePath: string): Promise<void> {
    return writeFile(path.join(basePath, this.name), this.generate());
  }
}
