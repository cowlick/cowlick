"use strict";
import {SaveData} from "./SaveData";
import {Save} from "./Script";

export class GameState {

  private data: SaveData[];

  constructor() {
    this.data = []
  }

  exists(index: number): boolean {
    return typeof this.data[index] === "undefined";
  }

  save(saveData: SaveData, info: Save): boolean {
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

  find(index: number): SaveData {
    return this.data[index];
  }
}
