"use strict";
import {Scenario} from "./Scenario";
import {Scene} from "./Scene";
import {SaveData} from "./SaveData";
import {GameError} from "./GameError";
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

  collectAssetIds(scenario: Scenario): string[] {
    let ids: string[] =[];
    for(const d of this.data) {
      ids = ids.concat(scenario.findScene(d).assetIds);
    }
    return ids;
  }
}
