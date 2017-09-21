"use strict";
import {GameState} from "../models/GameState";
import {Scene} from "../models/Scene";
import {SaveData} from "../models/SaveData";
import {Save} from "../models/Script";
import {Region, gameId} from "../Constant";

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
      const prefix = Region.saveDataPrefix + info.index + ".";
      this.write(result.variables, prefix + "variables");
      this.write(result.label, prefix + "label");
      this.write(result.frame, prefix + "frame");
      return;
    }
  }

  saveSystemVariables() {
    this.write(this.state.variables.system, Region.system);
  }

  private write(value: any, regionKey: string) {
    this.storage.write(
      {
        region: g.StorageRegion.Values,
        regionKey,
        userId: this.player.id,
        gameId
      },
      {
        data: JSON.stringify(value)
      }
    );
  }
}
