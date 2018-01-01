"use strict";
import * as core from "cowlick-core";
import {AlreadyReadManager} from "./AlreadyReadManager";

export interface GameStateParameters {
  data: core.SaveData[];
  variables: core.Variables;
  max: number;
}

/**
 * ゲーム情報を管理する。
 */
export class GameState {
  private data: core.SaveData[];
  private _variables: core.Variables;
  private max: number;
  private alreadyReadManager: AlreadyReadManager;

  constructor(param: GameStateParameters) {
    this.data = param.data;
    this._variables = param.variables;
    this.max = param.max;
    this.alreadyReadManager = new AlreadyReadManager(this._variables.builtin.alreadyRead);
  }

  get variables(): core.Variables {
    return this._variables;
  }

  /**
   * 指定したインデックスにセーブデータが存在する場合はtrue, そうでなければfalseを返す。
   *
   * @param index
   */
  exists(index: number): boolean {
    return typeof this.data[index] !== "undefined";
  }

  save(scenario: core.Scenario, config: core.Save): core.SaveData {
    if (config.index > this.max || config.index < 0) {
      throw new core.GameError("storage out of range", config);
    }
    const saveData = scenario.createSaveData(this._variables.current, config.description);
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
      this._variables.current = saveData.variables;
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
   * セーブデータ関連するAssetIdをすべて取得する。
   *
   * @param scenario シナリオデータ
   */
  collectAssetIds(scenario: core.Scenario): string[] {
    let ids: string[] = [];
    for (const d of this.data) {
      ids = ids.concat(scenario.findScene(d).assetIds);
    }
    return ids;
  }

  isAlreadyRead(label: string, frame: number) {
    return this.alreadyReadManager.isAlreadyRead(label, frame);
  }

  markAlreadyRead(label: string, frame: number) {
    this.alreadyReadManager.mark(label, frame);
  }

  private getVariables(variable: core.Variable) {
    if (variable.type === core.VariableType.system) {
      return this._variables.system;
    } else if (variable.type === core.VariableType.builtin) {
      return this._variables.builtin;
    } else if (variable.type === core.VariableType.current) {
      return this._variables.current;
    } else {
      throw new core.GameError("invalid variable type", variable);
    }
  }
}
