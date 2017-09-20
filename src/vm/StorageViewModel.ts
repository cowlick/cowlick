"use strict";
import {GameState} from "../models/GameState";
import {Scene} from "../models/Scene";
import {SaveData} from "../models/SaveData";
import {Save} from "../models/Script";

export class StorageViewModel {

  private state: GameState;
  private storage: g.Storage;
  private player: g.Player;

  constructor(storage: g.Storage, player: g.Player, state: GameState) {
    this.storage = storage;
    this.player = player;
    this.state = state;
  }

  load(index: number): SaveData {
    return this.state.load(index);
  }

  save(scene: Scene, info: Save): string | void {
    const result = this.state.save(scene, info);
    if(typeof result === "string") {
      return result;
    } else {
      const prefix = "data" + info.index + ".";
      this.saveVariables(result.variables, prefix + "variables.");
      this.write(result.label, prefix + "label");
      this.write(result.frame, prefix + "frame");
      return;
    }
  }

  saveSystemVariables() {
    this.saveVariables(this.state.variables.system, "system.");
  }

  private saveVariables(variables: any, prefix: string) {
    for(const key of Object.keys(variables)) {
      this.write(variables[key], prefix, key);
    }
  }

  private write(value: any, prefix: string, key?: string) {
    const isNumber = typeof value === "number";
    const region = isNumber ? g.StorageRegion.Counts : g.StorageRegion.Values;
    const regionKey = key ? prefix + key : prefix;
    const data = isNumber ? value : JSON.stringify(value);
    const storageValue = key ? { data, tag: key } : { data };
    this.storage.write(
      {
        region,
        regionKey,
        userId: this.player.id,
        gameId: "$gameId"
      },
      storageValue
    );
  }
}
