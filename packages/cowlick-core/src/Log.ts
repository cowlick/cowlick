"use strict";

/**
 * シーン、フレームを指すindex。
 */
export interface Index {
  /**
   * シーンラベル
   */
  label: string;
  /**
   *フレーム
   */
  frame: number;
}

/**
 * バックログで利用されるログ。
 */
export interface Log extends Index {
  /**
   * 表示されたテキスト
   */
  text?: string;
}
