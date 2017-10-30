import {Pane, Script} from "./models/Script";
import {Layer} from "./Constant";

/**
 * フォント設定
 */
export interface FontConfig {
  /**
   * 利用可能なフォントリスト
   */
  list: g.Font[];
  /**
   * 文字色
   */
  color: string;
}

/**
 * ゲームウィンドウ設定
 */
export interface WindowConfig {
  /**
   * メッセージレイヤに使用するPane
   */
  message: Pane;
  /**
   * システムUIに使用するスクリプト
   */
  // TODO: 制限を強める
  system: Script<any>[];
  /**
   * ロード画面に使用するスクリプト
   */
  load: Script<any>[];
  /**
   * セーブ画面に使用するスクリプト
   */
  save: Script<any>[];
}

/**
 * システム設定
 */
export interface SystemConfig {
  /**
   * 最大セーブ数
   */
  maxSaveCount: number;
}

/**
 * オーディオ設定。
 */
export interface AudioConfig {
  /**
   * ボイスの音量
   */
  voice: number;
  /**
   * 効果音の音量
   */
  se: number;
  /**
   * BGMの音量
   */
  bgm: number;
}

/**
 * ノベルエンジン全体の設定。
 */
export interface Config {
  window: WindowConfig;
  font: FontConfig;
  system: SystemConfig;
  audio: AudioConfig;
}

export const defaultConfig: Config = {
  window: {
    message: {
      layer: {
        name: Layer.message,
        x: 10,
        y: 10
      },
      width: g.game.width - 20,
      height: g.game.height - 20,
      touchable: true
    },
    system: [],
    load: [],
    save: []
  },
  font: {
    list: [
      new g.DynamicFont({
        game: g.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
      })
    ],
    color: "black"
  },
  system: {
    maxSaveCount: 100
  },
  audio: {
    voice: 0.5,
    se: 0.5,
    bgm: 0.5
  }
};
