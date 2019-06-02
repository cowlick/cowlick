import {Tag, VariableType} from "./Constant";
import {GameError} from "./GameError";

export interface ScriptNode {
  tag: Tag | string;
}

/**
 * スクリプト情報
 */
export type Script =
  | Layer
  | Image
  | FrameImage
  | Pane
  | Button
  | Text
  | Jump
  | Trigger
  | Choice
  | Link
  | PlayAudio
  | StopAudio
  | ChangeVolume
  | Video
  | Save
  | Load
  | Eval
  | Condition
  | RemoveLayer
  | Backlog
  | Fade
  | Timeout
  | IfElse
  | Slider
  | SaveLoadScene
  | MessageSpeed
  | Font
  | RealTimeDisplay
  | Click
  | Skip
  | ClearSystemVariables
  | ClearCurrentVariables
  | CloseLoadScene
  | AutoMode
  | Exception
  | Extension;

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
 * レイヤー
 */
export interface Layer extends ScriptNode, LayerConfig {
  tag: Tag.layer;
}

/**
 * 画像
 */
export interface Image extends ScriptNode {
  tag: Tag.image | Tag.frameImage;
  /**
   * アセットID
   */
  assetId: string;
  /**
   * レイヤー情報
   */
  layer: LayerConfig;
}

/**
 * フレーム画像
 */
export interface FrameImage extends Image {
  tag: Tag.frameImage;
  frame: {
    width: number;
    height: number;
    scale: number;
    frames: number[];
    interval?: number;
  };
}

export interface PaneDefinition {
  /**
   * レイヤー情報
   */
  layer: LayerConfig;
  /**
   * 幅
   */
  width: number;
  /**
   * 高さ
   */
  height: number;
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
 * 枠
 */
export interface Pane extends ScriptNode, PaneDefinition {
  tag: Tag.pane;
}

/**
 * ボタン
 */
export interface Button extends ScriptNode {
  tag: Tag.button;
  /**
   * 画像情報
   */
  image: Image;
  /**
   * クリック時に実行するスクリプト
   */
  scripts: Script[];
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
export interface Text extends ScriptNode {
  tag: Tag.text;
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
export interface Jump extends ScriptNode {
  tag: Tag.jump;
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
 * 選択肢
 */
export interface ChoiceItem extends Jump {
  /**
   * 選択肢として表示する文字列
   */
  text: string;
  /**
   * 選択された際に実行するスクリプトのPath
   */
  path?: string;
}

export const enum TriggerValue {
  On,
  Off
}

/**
 * ウィンドウのトリガー設定
 */
export interface Trigger extends ScriptNode {
  tag: Tag.trigger;
  value: TriggerValue;
}

export const enum Direction {
  Vertical,
  Horizontal
}

/**
 * 選択肢の集合
 */
export interface Choice extends ScriptNode {
  tag: Tag.choice;
  /**
   * レイヤー情報
   */
  layer: LayerConfig;
  /**
   * 選択肢一覧
   */
  values: ChoiceItem[];
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
export interface Link extends ScriptNode, PaneDefinition {
  tag: Tag.link;
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
  scripts: Script[];
}

/**
 * 再生対象音声情報
 */
export interface PlayAudio extends ScriptNode {
  tag: Tag.playAudio;
  /**
   * アセットID
   */
  assetId: string;
  /**
   * 音声が属するグループ名
   */
  group: string;
}

/**
 * 停止対象音声情報
 */
export interface StopAudio extends ScriptNode {
  tag: Tag.stopAudio;
  /**
   * アセットID
   */
  assetId?: string;
  /**
   * 音声が属するグループ名
   */
  group: string;
}

/**
 * ボリューム調整
 */
export interface ChangeVolume extends ScriptNode {
  tag: Tag.changeVolume;
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
export interface Video extends ScriptNode {
  tag: Tag.playVideo | Tag.stopVideo;
  /**
   * アセットID
   */
  assetId: string;
}

/**
 * セーブ命令
 */
export interface Save extends ScriptNode {
  tag: Tag.save;
  index: number;
  force?: boolean;
  description?: string;
}

/**
 * ロード命令
 */
export interface Load extends ScriptNode {
  tag: Tag.load;
  index: number;
}

export interface EvalDefinition {
  path: string;
}

/**
 * スクリプト実行
 */
export interface Eval extends ScriptNode, EvalDefinition {
  tag: Tag.evaluate;
}

/**
 * 条件付きスクリプト
 */
export interface Condition extends ScriptNode, EvalDefinition {
  tag: Tag.condition;
  scripts: Script[];
}

/**
 * レイヤー削除命令
 */
export interface RemoveLayer extends ScriptNode {
  tag: Tag.removeLayer;
  name: string;
}

/**
 * 過去ログ表示
 */
export interface Backlog extends ScriptNode {
  tag: Tag.backlog;
  scripts: Script[];
}

/**
 * フェード命令
 */
export interface Fade extends ScriptNode {
  tag: Tag.fadeIn | Tag.fadeOut;
  layer: string;
  duration: number;
  after: Script[];
}

/**
 * スクリプトのタイムアウト実行
 */
export interface Timeout extends ScriptNode {
  tag: Tag.timeout;
  milliseconds: number;
  scripts: Script[];
}

/**
 * スクリプトの条件分岐
 */
export interface IfElse extends ScriptNode {
  tag: Tag.ifElse;
  conditions: Condition[];
  elseBody: Script[];
}

export interface Slider extends ScriptNode {
  tag: Tag.slider;
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
export interface SaveLoadScene extends ScriptNode {
  tag: Tag.openSaveScene | Tag.openLoadScene;
  vertical: number;
  horizontal: number;
  button: Position;
  padding: number;
  base: Pane;
}

export interface CloseLoadScene extends ScriptNode {
  tag: Tag.closeLoadScene;
}

/**
 * メッセージ速度
 */
export interface MessageSpeed extends ScriptNode {
  tag: Tag.messageSpeed;
  speed: number;
}

/**
 * フォント設定
 */
export interface Font extends ScriptNode {
  tag: Tag.font;
  size: "default" | number;
  color: string;
}

/**
 * メッセージ即時表示設定
 */
export interface RealTimeDisplay extends ScriptNode {
  tag: Tag.realTimeDisplay;
  enabled: boolean;
}

/**
 * ユーザ拡張
 */
export interface Extension extends ScriptNode {
  tag: Tag.extension;
  data: any;
}

export interface Click extends ScriptNode {
  tag: Tag.click;
  scripts: Script[];
}

export interface Skip extends ScriptNode {
  tag: Tag.skip;
}

export interface ClearSystemVariables extends ScriptNode {
  tag: Tag.clearSystemVariables;
}

export interface ClearCurrentVariables extends ScriptNode {
  tag: Tag.clearCurrentVariables;
}

export interface AutoMode extends ScriptNode {
  tag: Tag.autoMode;
}

export interface Exception extends ScriptNode {
  tag: Tag.exception;
  error: GameError;
}
