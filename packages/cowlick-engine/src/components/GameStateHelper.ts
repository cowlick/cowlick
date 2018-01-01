"use strict";
import {SaveData, Variables, BuiltinVariable} from "cowlick-core";
import {Config} from "cowlick-config";
import {GameState} from "../models/GameState";
import {gameId, Region} from "../Constant";

interface KeyValue {
  key: g.StorageKey;
  value: SaveData;
}

const prefixLength = Region.saveDataPrefix.length;

function loadFromStorage(scene: g.Scene, keys: g.StorageKey[], max: number) {
  const variables: Variables = {
    builtin: {},
    system: {},
    current: {}
  };
  const data: KeyValue[] = [];
  for (const key of keys) {
    for (const value of scene.storageValues.get(key)) {
      const v = typeof value.data === "number" ? value.data : JSON.parse(value.data);
      if (key.regionKey === Region.system) {
        variables.system = v;
      } else {
        let s = data.find(kv => kv.key === value.storageKey);
        const keys = key.regionKey.split(".");
        if (!s) {
          const i = parseInt(keys[0].substring(prefixLength), 10);
          s = {
            key: value.storageKey,
            value: {
              label: "",
              variables: {},
              logs: []
            }
          };
          data[i] = s;
        }
        const label = keys[keys.length - 1];
        switch (label) {
          case "label":
            s.value.label = v;
            break;
          case "logs":
            s.value.logs = v;
            break;
          case "description":
            s.value.description = v;
            break;
          default:
            s.value.variables = v;
            break;
        }
      }
    }
  }
  return {
    data: data.map(kv => kv.value),
    variables,
    max
  };
}

export function loadGameState(scene: g.Scene, keys: g.StorageKey[], config: Config): GameState {
  const max = config.system.maxSaveCount;
  const result = loadFromStorage(scene, keys, max);
  const defaults: [string, any][] = [
    [BuiltinVariable.selectedFont, 0],
    [BuiltinVariable.autoMode, false],
    [BuiltinVariable.autoMessageDuration, config.system.autoMessageDuration],
    [BuiltinVariable.messageSpeed, config.system.messageSpeed],
    [BuiltinVariable.realTimeDisplay, config.system.realTimeDisplay],
    [BuiltinVariable.fontSize, config.font.size],
    [BuiltinVariable.fontColor, config.font.color],
    [BuiltinVariable.alreadyRead, {}]
  ];
  for (const [key, value] of defaults) {
    if (!(key in result.variables.builtin)) {
      result.variables.builtin[key] = value;
    }
  }
  return new GameState(result);
}

export function createStorageKeys(player: g.Player, max: number): g.StorageKey[] {
  const ks = [
    {region: g.StorageRegion.Values, regionKey: Region.system, userId: player.id, gameId},
    {region: g.StorageRegion.Values, regionKey: Region.builtin, userId: player.id, gameId}
  ];
  for (let i = 0; i < max - 1; i++) {
    ks.push({region: g.StorageRegion.Values, regionKey: Region.saveDataPrefix + i, userId: player.id, gameId});
  }
  return ks;
}
