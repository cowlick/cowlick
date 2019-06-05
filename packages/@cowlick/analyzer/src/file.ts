import {promisify} from "util";
import * as fs from "fs";
import * as path from "path";

/**
 * 拡張子を除いたファイル名を取得する。
 *
 * @param target ファイル
 */
export const filename = (target: string): string => {
  return path.basename(target, path.extname(target));
};

export const writeFile = promisify(fs.writeFile);
export const readFile = promisify(fs.readFile);
export const mkdir = promisify(fs.mkdir);
