"use strict";
import * as path from "path";

export function filename(target: string): string {
  return path.basename(target, path.extname(target));
}