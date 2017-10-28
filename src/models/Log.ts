"use strict";
import {Frame} from "./Frame";

/**
 * バックログで利用されるログ。
 */
export interface Log {
  /**
   * 表示されたテキスト
   */
  text: string;
  /**
   * ログ作成に利用したオリジナルのフレーム
   */
  frame: Frame;
}