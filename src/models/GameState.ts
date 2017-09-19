"use strict";
import {Scene} from "./Scene";
import {SaveData} from "./SaveData";
import {Save} from "./Script";

export class GameState {

  private data: SaveData[];
  private _variables: {
    system: any;
    current: any;
  };

  constructor() {
    this.data = [];
    this._variables = {
      system: {},
      current: {}
    };
  }

  get variables(): any {
    return this._variables;
  }

  exists(index: number): boolean {
    return typeof this.data[index] === "undefined";
  }

  save(scene: Scene, info: Save): boolean {
    const saveData = scene.createSaveData(this._variables.current);
    if(info.force) {
      this.data[info.index] = saveData;
      return true;
    } else {
      if(this.exists(info.index)) {
        return false;
      } else {
        this.data[info.index] = saveData;
        return true;
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
}
