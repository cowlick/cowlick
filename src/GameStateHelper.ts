"use strict";
import {GameState, Variables} from "./models/GameState";
import {SaveData} from "./models/SaveData";
import {Region, gameId} from "./Constant";

interface KeyValue {
  key: g.StorageKey;
  value: SaveData;
}

const prefixLength = Region.saveDataPrefix.length;

function loadFromStorage(scene: g.Scene, keys: g.StorageKey[], max: number) {
  const variables: Variables = {
    system: {},
    current: {}
  };
  const data: KeyValue[] = [];
  for(const key of keys) {
    for(const value of scene.storageValues.get(key)) {
      const v = typeof value.data === "number" ? value.data : JSON.parse(value.data);
      if(key.regionKey === Region.system) {
        variables.system = v;
      } else {
        let s = data.find((kv) => kv.key === value.storageKey);
        const keys = key.regionKey.split(".");
        if(! s) {
          const i = parseInt(keys[0].substring(prefixLength), 10);
          s = {
            key: value.storageKey,
            value: {
              label: "",
              frame: 0,
              variables: {}
            }
          };
          data[i] = s;
        }
        const label = keys[keys.length - 1];
        switch(label) {
          case "frame":
            s.value.frame = v;
            break;
          case "label":
            s.value.label = v;
            break;
          default:
            s.value.variables = v;
            break;
        }
      }
    }
  }
  return {
    data: data.map((kv) => kv.value),
    variables
  };
}

export function loadGameState(scene: g.Scene, keys: g.StorageKey[], max: number): GameState {
  const result = loadFromStorage(scene, keys, max);
  return new GameState(result.data, result.variables, max);
}

export function createStorageKeys(player: g.Player, max: number): g.StorageKey[] {
  const ks = [
    {region: g.StorageRegion.Values, regionKey: Region.system, userId: player.id, gameId},
  ];
  for(let i = 0; i < max - 1; i++) {
    ks.push({region: g.StorageRegion.Values, regionKey: Region.saveDataPrefix + i, userId: player.id, gameId});
  }
  return ks;
}
