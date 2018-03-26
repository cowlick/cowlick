"use strict";

/**
 * バックログで利用されるログ。
 */
export interface Log {
  /**
   * フレームインデックス
   */
  frame: number;
  /**
   * 表示されたテキスト
   */
  text?: string;
}
