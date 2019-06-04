import * as core from "@cowlick/core";

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
  /**
   * 文字サイズ
   */
  size: number;
}

/**
 * メッセージウィンドウ設定
 */
export interface MessageWindowConfig {
  /**
   * メッセージレイヤに使用するPane
   */
  ui: core.PaneDefinition;

  /**
   * 先頭文字の位置
   */
  top: {
    x: number;
    y: number;
  };

  marker: core.Script[];
}

/**
 * ゲームウィンドウ設定
 */
export interface WindowConfig {
  message: MessageWindowConfig;
  /**
   * システムUIに使用するスクリプト
   */
  // TODO: 制限を強める
  system: core.Script[];

  /**
   * プライオリティに基づいてレイヤーの表示順序を設定します。
   *
   * この設定に登録されていないレイヤーは、スクリプト内で最後に現れたレイヤーが手前に表示されるようなプライオリティが設定されます。
   */
  priority: [string, number][];
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
   * 1文字を表示する速度(ms)
   */
  messageSpeed: number;
  /**
   * オートモード時のメッセージ送り速度(ms)
   */
  autoMessageDuration: number;
  /**
   * 既読を有効にするかどうか
   */
  alreadyRead: boolean;
  /**
   * メッセージ即時表示
   */
  realTimeDisplay: boolean;
  /**
   * システムデータを自動で保存するかどうか
   */
  autoSave: boolean;
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

const size = 18;

export const defaultConfig = () =>
  ({
    window: {
      message: {
        ui: {
          layer: {
            name: core.LayerKind.message,
            x: 10,
            y: 10
          },
          width: g.game.width - 20,
          height: g.game.height - 20,
          touchable: true
        },
        top: {
          x: 30,
          y: 20
        },
        marker: []
      },
      system: [],
      priority: [["message", 0], ["choice", 1], ["system", 2]]
    },
    font: {
      list: [
        new g.DynamicFont({
          game: g.game,
          fontFamily: g.FontFamily.SansSerif,
          size
        })
      ],
      color: "black",
      alreadyReadColor: "#4444FF",
      size
    },
    system: {
      maxSaveCount: 100,
      messageSpeed: 1000 / g.game.fps,
      autoMessageDuration: 1500,
      alreadyRead: false,
      realTimeDisplay: false,
      autoSave: true
    },
    audio: {
      voice: 0.5,
      se: 0.5,
      bgm: 0.5
    }
  } as Config);
