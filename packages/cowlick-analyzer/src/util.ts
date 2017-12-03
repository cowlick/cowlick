"use strict";
import * as path from "path";

/**
 * 拡張子を除いたファイル名を取得する。
 *
 * @param target ファイル
 */
export function filename(target: string): string {
  return path.basename(target, path.extname(target));
}

export const waitTransition = "waitTransition";
