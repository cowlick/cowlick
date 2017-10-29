"use strict";
import {Scenario} from "./Scenario";
import {Scene} from "./Scene";
import {SaveData} from "./SaveData";
import {GameError} from "./GameError";
import {Save, Variable} from "./Script";
import {VariableType} from "../Constant";

/**
 * ゲームの変数
 */
export interface Variables {
  /**
   * システム変数
   */
  system: any;
  /**
   * 現在のゲーム変数
   */
  current: any;
}

/**
 * ゲーム情報を管理する。
 */
export class GameState {

  private data: SaveData[];
  private _variables: Variables;
  private max: number;

  constructor(data: SaveData[], variables: Variables, max: number) {
    this.data = data;
    this._variables = variables;
    this.max = max;
  }

  get variables(): Variables {
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

  save(scene: Scene, config: Save): SaveData {
    if(config.index > this.max || config.index < 0) {
      throw new GameError("storage out of range", config);
    }
    const saveData = scene.createSaveData(this._variables.current, config.description);
    if(config.force) {
      this.data[config.index] = saveData;
      return saveData;
    } else {
      if(this.exists(config.index)) {
        throw new GameError("save data already exists", config);
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
  load(index: number): SaveData {
    const saveData = this.data[index];
    if(saveData) {
      this._variables.current = saveData.variables;
    }
    return saveData;
  }

  /**
   * 変数に格納された値を取得する。
   *
   * @param variable 変数情報
   */
  getValue(variable: Variable): any {
    let target: any;
    if(variable.type === VariableType.system) {
      target = this._variables.system;
    } else if(variable.type === VariableType.current) {
      target = this._variables.current;
    } else {
      throw new GameError("invalid variable type", variable);
    }
    return target[variable.name];
  }

  /**
   * 変数に格納された値を文字列で取得する。
   *
   * @param variable 変数情報
   */
  getStringValue(variable: Variable): string {
    const result = this.getValue(variable);
    if(result) {
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
  setValue(variable: Variable, value: any) {
    const target = variable.type === "system" ? this._variables.system : this._variables.current;
    target[variable.name] = value;
  }

  /**
   * セーブデータ関連するAssetIdをすべて取得する。
   *
   * @param scenario シナリオデータ
   */
  collectAssetIds(scenario: Scenario): string[] {
    let ids: string[] =[];
    for(const d of this.data) {
      ids = ids.concat(scenario.findScene(d).assetIds);
    }
    return ids;
  }
}
