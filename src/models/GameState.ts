"use strict";
import {Scene} from "./Scene";
import {SaveData} from "./SaveData";
import {Save, Variable} from "./Script";

export interface Variables {
  system: any;
  current: any;
}

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

  exists(index: number): boolean {
    return typeof this.data[index] !== "undefined";
  }

  save(scene: Scene, config: Save): string | SaveData {
    if(config.index > this.max || config.index < 0) {
      return "storage out of range: " + config.index;
    }
    const saveData = scene.createSaveData(this._variables.current);
    if(config.force) {
      this.data[config.index] = saveData;
      return saveData;
    } else {
      if(this.exists(config.index)) {
        return "save data already exists: " + config.index;
      } else {
        this.data[config.index] = saveData;
        return saveData;
      }
    }
  }

  load(index: number): SaveData {
    const saveData = this.data[index];
    if(saveData) {
      this._variables.current = saveData.variables;
    }
    return saveData;
  }

  getStringValue(variable: Variable): string {
    const target = variable.type === "system" ? this._variables.system : this._variables.current;
    const result = target[variable.name];
    if(result) {
      return String(result);
    } else {
      return undefined;
    }
  }
}
