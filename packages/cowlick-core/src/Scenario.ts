"use strict";
import {Scene} from "./Scene";
import {Frame} from "./Frame";
import {Jump} from "./Script";
import {SaveData} from "./SaveData";
import {Log} from "./Log";
import {GameError} from "./GameError";

/**
 * シナリオデータ。
 */
export class Scenario {
  private index = 0;
  private scenes: Scene[];
  onLoaded: g.Trigger<Frame>;
  private logs: Log[];

  constructor(scenes: Scene[]) {
    this.scenes = scenes;
    this.onLoaded = new g.Trigger<Frame>();
    this.logs = [];
  }

  get backlog() {
    return this.logs;
  }

  set backlog(logs: Log[]) {
    this.logs = logs;
  }

  get scene() {
    if (this.index < this.scenes.length) {
      return this.scenes[this.index];
    } else {
      throw new GameError("scene not found", {index: this.index});
    }
  }

  get frame() {
    return this.scene.frame;
  }

  /**
   * シーンを更新する。
   *
   * @param game
   * @param target 遷移情報
   */
  update(game: g.Game, target: Jump) {
    const i = this.scenes.findIndex(s => s.label === target.label);
    if (i > -1) {
      this.index = i;
      this.scenes[this.index].reset(target.frame);
      return;
    }
    const s = g._require(game, target.label);
    if (s) {
      this.scenes.push(s);
      this.index = this.scenes.length - 1;
    } else {
      throw new GameError("scene not found", target);
    }
  }

  /**
   * フレーム情報をロードする。
   */
  load() {
    const frame = this.frame;
    if (frame) {
      this.pushLog(this.scene.index);
      this.onLoaded.fire(frame);
    } else {
      throw new GameError("frame not found", this.scene.index);
    }
  }

  /**
   * 次のフレームを呼び出す。
   */
  next() {
    this.scene.next();
    this.load();
  }

  /**
   * セーブデータに対応するシーンを検索する。
   *
   * @param data
   */
  findScene(data: SaveData): Scene {
    return this.scenes.find(s => s.label === data.label);
  }

  /**
   * シナリオデータに紐づいていた情報をクリアする。
   */
  clear() {
    this.logs = [];
    this.onLoaded.removeAll();
  }

  /**
   * テキストログを登録する。
   *
   * @param text
   */
  pushTextLog(text: string) {
    const index = this.scene.index;
    const log = this.logs.find(l => l.frame === index);
    log.text = text;
  }

  /**
   * セーブデータを作成する。
   *
   * @param variables
   * @param description
   */
  createSaveData(variables: any, description?: string): SaveData {
    const result: SaveData = {
      label: this.scene.label,
      variables,
      logs: this.logs
    };
    if (description) {
      result.description = description;
    }
    return result;
  }

  private pushLog(frame: number) {
    const i = this.logs.find(l => l.frame === frame);
    if (!i) {
      this.logs.push({
        frame
      });
    }
  }
}
