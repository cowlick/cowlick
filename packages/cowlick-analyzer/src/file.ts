"use strict";
import {promisify} from "util";
import * as fs from "fs";
import * as path from "path";

/**
 * 拡張子を除いたファイル名を取得する。
 *
 * @param target ファイル
 */
export function filename(target: string): string {
  return path.basename(target, path.extname(target));
}

export const writeFile = promisify(fs.writeFile);
export const readFile = promisify(fs.readFile);
export const exists = promisify(fs.exists);
export const mkdir = promisify(fs.mkdir);
