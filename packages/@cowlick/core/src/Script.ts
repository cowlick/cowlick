import {VariableType} from ".";

/**
 * レイヤー情報
 */
export interface LayerConfig {
  /**
   * レイヤー名
   */
  name: string;
  /**
   * X座標
   */
  x?: number;
  /**
   * Y座標
   */
  y?: number;
  /**
   * 不透明度
   */
  opacity?: number;
  /**
   * 可視性
   */
  visible?: boolean;
}

/**
 * 画像
 */
export interface Image {
  /**
   * アセットID
   */
  assetId: string;
  /**
   * レイヤー情報
   */
  layer: LayerConfig;
  frame?: {
    width: number;
    height: number;
    scale: number;
    frames: number[];
    interval?: number;
  };
}

/**
 * 枠
 */
export interface Pane {
  /**
   * レイヤー情報
   */
  layer: LayerConfig;
  /**
   * 幅
   */
  width?: number;
  /**
   * 高さ
   */
  height?: number;
  /**
   * 背景画像
   */
  backgroundImage?: string;
  padding?: number;
  backgroundEffector?: {
    borderWidth: number;
  };
  /**
   * クリック可能かどうか
   */
  touchable?: boolean;
}

/**
 * ボタン
 */
export interface Button {
  /**
   * 画像情報
   */
  image: Image;
  /**
   * X座標
   */
  x: number;
  /**
   * Y座標
   */
  y: number;
  /**
   * クリック時に実行するスクリプト
   */
  scripts: Script<any>[];
}

/**
 * ルビ
 */
export interface Ruby {
  value: string;
}

/**
 * 変数呼び出し
 */
export interface Variable {
  type: VariableType;
  name: string;
}

/**
 * テキスト
 */
export interface Text {
  /**
   * 現在表示中のテキストを消去するかどうか
   */
  clear?: boolean;
  /**
   * テキストを構成するデータ
   */
  values: (string | Ruby[] | Variable)[];
}

/**
 * 遷移情報
 */
export interface Jump {
  /**
   * シーンラベル
   */
  label: string;
  /**
   * フレームインデックス
   */
  frame?: number;
}

/**
 * スクリプト情報
 */
export interface Script<T> {
  /**
   * スクリプト名
   */
  tag: string;
  /**
   * スクリプト実行に利用するデータ
   */
  data: T;
}

/**
 * スクリプトからアセットのIDを収集する。
 *
 * @param scripts
 */
export function collectAssetIds(scripts: Script<any>[]): string[] {
  let ids: string[] = [];
  for (const s of scripts) {
    if (typeof s.data === "object") {
      if ("assetId" in s.data) {
        ids.push(s.data.assetId);
      }
      if ("backgroundImage" in s.data) {
        ids.push(s.data.backgroundImage);
      }
      if ("label" in s.data) {
        ids.push(s.data.label);
      }
      if ("scripts" in s.data) {
        ids.push(...collectAssetIds(s.data.scripts));
      }
    }
  }
  return ids;
}

/**
 * 選択肢
 */
export interface ChoiceItem extends Script<Jump> {
  /**
   * 選択肢として表示する文字列
   */
  text: string;
  /**
   * 選択された際に実行するスクリプトのPath
   */
  path?: string;
}

/**
 * ウィンドウのトリガー設定
 */
export const enum Trigger {
  On,
  Off
}

export const enum Direction {
  Vertical,
  Horizontal
}

/**
 * 選択肢の集合
 */
export interface Choice {
  /**
   * レイヤー情報
   */
  layer: LayerConfig;
  /**
   * 選択肢一覧
   */
  values: ChoiceItem[];
  /**
   * X座標
   */
  x?: number;
  /**
   * Y座標
   */
  y?: number;
  /**
   * 幅
   */
  width?: number;
  /**
   * 高さ
   */
  height?: number;
  /**
   * 向き
   */
  direction?: Direction;
  backgroundImage?: string;
  padding?: number;
  backgroundEffector?: {
    borderWidth: number;
  };
}

/**
 * リンク
 */
export interface Link extends Pane {
  /**
   * 幅
   */
  width: number;
  /**
   * 高さ
   */
  height: number;
  /**
   * 表示する文字列
   */
  text: string;
  /**
   * フォントサイズ
   */
  fontSize?: number;
  /**
   * リンクをクリックしたときに実行するスクリプト
   */
  scripts: Script<any>[];
}

/**
 * 音声情報
 */
export interface Audio {
  /**
   * アセットID
   */
  assetId: string;
  /**
   * 音声が属するグループ名
   */
  group?: string;
}

/**
 * ボリューム調整
 */
export interface ChangeVolume {
  /**
   * グループ名
   */
  groupName: string;
  /**
   * ボリューム
   */
  volume: number;
}

/**
 * ビデオ情報
 */
export interface Video {
  /**
   * アセットID
   */
  assetId: string;
}

/**
 * セーブ命令
 */
export interface Save {
  index: number;
  force?: boolean;
  description?: string;
}

/**
 * ロード命令
 */
export interface Load {
  index: number;
}

/**
 * スクリプト実行
 */
export interface Eval {
  path: string;
}

/**
 * 条件付きスクリプト
 */
export interface Condition extends Eval {
  scripts: Script<any>[];
}

/**
 * レイヤー削除命令
 */
export interface RemoveLayer {
  name: string;
}

/**
 * 過去ログ表示
 */
export interface Backlog {
  scripts: Script<any>[];
}

/**
 * フェード命令
 */
export interface Fade {
  layer: string;
  duration: number;
}

/**
 * スクリプトのタイムアウト実行
 */
export interface Timeout {
  milliseconds: number;
  scripts: Script<any>[];
}

/**
 * スクリプトの条件分岐
 */
export interface IfElse {
  conditions: Condition[];
  elseBody: Script<any>[];
}

export interface Slider {
  /**
   * レイヤー情報
   */
  layer: LayerConfig;
  /**
   * 向き
   */
  direction: Direction;
  /**
   * 長さ
   */
  length: number;
  /**
   * 最大値
   */
  max: number;
  /**
   * 初期値
   */
  default: number;
  /**
   * 変更対象の変数
   */
  target: Variable;
}

export enum Position {
  Top,
  Bottom
}

/**
 * セーブ、ロードシーン情報
 */
export interface SaveLoadScene {
  vertical: number;
  horizontal: number;
  button: Position;
  padding: number;
  base: Pane;
}

/**
 * メッセージ速度
 */
export interface MessageSpeed {
  speed: number;
}

/**
 * フォント設定
 */
export interface Font {
  size: "default" | number;
  color: string;
}

/**
 * メッセージ即時表示設定
 */
export interface RealTimeDisplay {
  enabled: boolean;
}
