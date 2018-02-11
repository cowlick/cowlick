"use strict";
import {Scenario, Save, SaveData} from "cowlick-core";
import {GameState} from "./GameState";
import {Region, gameId} from "../Constant";

export interface StorageParameters {
  storage: g.Storage;
  state: GameState;
  player: g.Player;
  scenario: Scenario;
}

export class Storage {
  private state: GameState;
  private storage: g.Storage;
  private player: g.Player;
  private scenario: Scenario;

  constructor(params: StorageParameters) {
    this.storage = params.storage;
    this.player = params.player;
    this.state = params.state;
    this.scenario = params.scenario;
  }

  load(index: number): SaveData {
    return this.state.load(index);
  }

  save(info: Save) {
    const result = this.state.save(info);
    const prefix = Region.saveDataPrefix + info.index + ".";
    this.write(result.variables, prefix + "variables");
    this.write(result.label, prefix + "label");
    this.write(result.logs, prefix + "logs");
    if (result.description) {
      this.write(result.description, prefix + "description");
    }
  }

  saveBuiltinVariables() {
    this.write(this.state.variables.builtin, Region.builtin);
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
