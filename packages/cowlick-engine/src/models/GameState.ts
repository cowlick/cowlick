"use strict";
import * as core from "cowlick-core";
import {AlreadyReadManager} from "./AlreadyReadManager";

export interface GameStateParameters {
  data: core.SaveData[];
  variables: core.Variables;
  max: number;
  scenario: core.Scenario;
}

/**
 * ゲーム情報を管理する。
 */
export class GameState {
  private data: core.SaveData[];
  private currentVariables: core.Variables;
  private sceneStartVariables: any;
  private max: number;
  private alreadyReadManager: AlreadyReadManager;
  private scenario: core.Scenario;

  constructor(param: GameStateParameters) {
    this.data = param.data;
    this.currentVariables = param.variables;
    this.sceneStartVariables = this.currentVariables.current;
    this.max = param.max;
    this.alreadyReadManager = new AlreadyReadManager(this.currentVariables.builtin.alreadyRead);
    this.scenario = param.scenario;
  }

  get variables(): core.Variables {
    return this.currentVariables;
  }

  /**
   * 指定したインデックスにセーブデータが存在する場合はtrue, そうでなければfalseを返す。
   *
   * @param index
   */
  exists(index: number): boolean {
    return typeof this.data[index] !== "undefined";
  }

  /**
   * 指定した領域にセーブデータを保存する。
   *
   * @param config 保存設定
   */
  save(config: core.Save): core.SaveData {
    if (config.index > this.max || config.index < 0) {
      throw new core.GameError("storage out of range", config);
    }
    const saveData = this.scenario.createSaveData(this.sceneStartVariables, config.description);
    if (config.force) {
      this.data[config.index] = saveData;
      return saveData;
    } else {
      if (this.exists(config.index)) {
        throw new core.GameError("save data already exists", config);
      } else {
        this.data[config.index] = saveData;
        return saveData;
      }
    }
  }

  /**
   * 指定したインデックスのセーブデータをロードする。
   *
   * @param index
   */
  load(index: number): core.SaveData {
    const saveData = this.data[index];
    if (saveData) {
      this.currentVariables.current = saveData.variables;
      this.sceneStartVariables = saveData.variables;
      this.scenario.backlog = saveData.logs;
    }
    return saveData;
  }

  /**
   * 変数に格納された値を取得する。
   *
   * @param variable 変数情報
   */
  getValue(variable: core.Variable): any {
    return this.getVariables(variable)[variable.name];
  }

  /**
   * 変数に格納された値を文字列で取得する。
   *
   * @param variable 変数情報
   */
  getStringValue(variable: core.Variable): string {
    const result = this.getValue(variable);
    if (result) {
      return String(result);
    } else {
      return undefined;
    }
  }

  /**
   * 指定した変数に値を設定する。
   *
   * @param variable 変数情報
   * @param value 値
   */
  setValue(variable: core.Variable, value: any) {
    this.getVariables(variable)[variable.name] = value;
  }

  /**
   * セーブデータに関連するAssetIdをすべて取得する。
   *
   * @param scenario シナリオデータ
   */
  collectAssetIds(game: g.Game): string[] {
    let ids: string[] = [];
    for (const d of this.data) {
      // まだセーブされていない番地はundefinedなので飛ばす
      if (d) {
        ids.push(...this.scenario.findScene(game, d).assetIds);
      }
    }
    return ids;
  }

  isAlreadyRead(label: string, frame: number) {
    return this.alreadyReadManager.isAlreadyRead(label, frame);
  }

  markAlreadyRead(label: string, frame: number) {
    this.alreadyReadManager.mark(label, frame);
  }

  copyGameVariables() {
    this.sceneStartVariables = this.currentVariables.current;
  }

  private getVariables(variable: core.Variable) {
    if (variable.type === core.VariableType.system) {
      return this.currentVariables.system;
    } else if (variable.type === core.VariableType.builtin) {
      return this.currentVariables.builtin;
    } else if (variable.type === core.VariableType.current) {
      return this.currentVariables.current;
    } else {
      throw new core.GameError("invalid variable type", variable);
    }
  }

  createSnapshot(): core.SaveData {
    return this.scenario.createSaveData(this.sceneStartVariables);
  }
}
