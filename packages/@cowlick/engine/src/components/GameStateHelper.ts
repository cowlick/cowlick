"use strict";
import * as core from "@cowlick/core";
import {Config} from "@cowlick/config";
import {GameState} from "../models/GameState";
import {gameId, Region} from "../Constant";

interface KeyValue {
  key: g.StorageKey;
  value: core.SaveData;
}

const prefixLength = Region.saveDataPrefix.length;

function findOrCreateKeyValue(data: KeyValue[], key: g.StorageKey, keys: string[], value: g.StorageValue): KeyValue {
  const s = data.find(kv => kv.key === value.storageKey);
  if (s) {
    return s;
  } else {
    const i = parseInt(keys[0].substring(prefixLength), 10);
    const defaultKV: KeyValue = {
      key,
      value: {
        label: "",
        variables: {},
        logs: []
      }
    };
    data[i] = defaultKV;
    return defaultKV;
  }
}

function loadFromStorage(scene: g.Scene, keys: g.StorageKey[], max: number) {
  const variables: core.Variables = {
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
        const keys = key.regionKey.split(".");
        const s = findOrCreateKeyValue(data, key, keys, value);
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

export function loadGameState(
  scene: g.Scene,
  keys: g.StorageKey[],
  config: Config,
  scenario: core.Scenario
): GameState {
  const max = config.system.maxSaveCount;
  const result = loadFromStorage(scene, keys, max);
  const defaults: [string, any][] = [
    [core.BuiltinVariable.selectedFont, 0],
    [core.BuiltinVariable.autoMode, false],
    [core.BuiltinVariable.autoMessageDuration, config.system.autoMessageDuration],
    [core.BuiltinVariable.messageSpeed, config.system.messageSpeed],
    [core.BuiltinVariable.realTimeDisplay, config.system.realTimeDisplay],
    [core.BuiltinVariable.fontSize, config.font.size],
    [core.BuiltinVariable.fontColor, config.font.color],
    [core.BuiltinVariable.alreadyRead, {}]
  ];
  for (const [key, value] of defaults) {
    if (!(key in result.variables.builtin)) {
      result.variables.builtin[key] = value;
    }
  }
  return new GameState({
    ...result,
    scenario
  });
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
