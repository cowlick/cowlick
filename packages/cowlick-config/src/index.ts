import {Pane, Script, Layer} from "cowlick-core";

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
  /**
   * 既読文字色
   */
  alreadyReadColor: string;
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
}

/**
 * システム設定
 */
export interface SystemConfig {
  /**
   * 最大セーブ数
   */
  maxSaveCount: number;
  /**
   * オートモード時のメッセージ送り速度(ms)
   */
  autoMessageSpeed: number;
  /**
   * 既読を有効にするかどうか
   */
  alreadyRead: boolean;
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
    system: []
  },
  font: {
    list: [
      new g.DynamicFont({
        game: g.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
      })
    ],
    color: "black",
    alreadyReadColor: "#4444FF"
  },
  system: {
    maxSaveCount: 100,
    autoMessageSpeed: 1500,
    alreadyRead: false
  },
  audio: {
    voice: 0.5,
    se: 0.5,
    bgm: 0.5
  }
};
