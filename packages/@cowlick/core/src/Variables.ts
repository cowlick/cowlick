/**
 * ゲームの変数全体を表す
 */
export interface Variables {
  /**
   * エンジン組み込み変数
   */
  builtin: any;
  /**
   * ゲームシステム変数
   */
  system: any;
  /**
   * 現在のゲーム変数
   */
  current: any;
}
