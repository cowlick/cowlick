"use strict";
import {GameState, Variables} from "./models/GameState";
import {SaveData} from "./models/SaveData";

const gameId = "$gameId";
const systemKeys = "system.*";

interface KeyValue {
  key: g.StorageKey;
  value: SaveData;
}

function loadFromStorage(scene: g.Scene, keys: g.StorageKey[], max: number) {
  const variables: Variables = {
    system: {},
    current: {}
  };
  const data: KeyValue[] = [];
  for(const key of keys) {
    for(const value of scene.storageValues.get(key)) {
      const v = typeof value.data === "number" ? value.data : JSON.parse(value.data);
      if(key.regionKey === systemKeys) {
        variables.system[value.tag] = v;
      } else {
        let s = data.find((kv) => kv.key === value.storageKey);
        if(! s) {
          const i = 0;
          s = {
            key: value.storageKey,
            value: {
              label: "",
              frame: 0,
              variables: {}
            }
          }
          data[i] = s;
        }
        const keys = key.regionKey.split(".");
        const label = keys[keys.length - 1];
        switch(label) {
          case "frame":
            s.value.frame = v;
            break;
          case "label":
            s.value.label = v;
            break;
          default:
            s.value.variables[value.tag] = v;
            break;
        }
      }
    }
  }
  return {
    data: data.map((kv) => kv.value),
    variables
  }
}

export function loadGameState(scene: g.Scene, keys: g.StorageKey[], max: number): GameState {
  const result = loadFromStorage(scene, keys, max);
  return new GameState(result.data, result.variables, max);
}

export function createStorageKeys(player: g.Player, max: number): g.StorageKey[] {
  const ks = [
    {region: g.StorageRegion.Counts, regionKey: systemKeys, userId: player.id, gameId},
    {region: g.StorageRegion.Values, regionKey: systemKeys, userId: player.id, gameId},
  ];
  for(let i = 0; i < max - 1; i++) {
    const prefix = "data" + i + ".";
    ks.push({region: g.StorageRegion.Counts, regionKey: prefix + "variables.*", userId: player.id, gameId});
    ks.push({region: g.StorageRegion.Counts, regionKey: prefix + "label", userId: player.id, gameId});
    ks.push({region: g.StorageRegion.Counts, regionKey: prefix + "frame", userId: player.id, gameId});
    ks.push({region: g.StorageRegion.Values, regionKey: prefix + "variables.*", userId: player.id, gameId});
    ks.push({region: g.StorageRegion.Values, regionKey: prefix + "label", userId: player.id, gameId});
    ks.push({region: g.StorageRegion.Values, regionKey: prefix + "frame", userId: player.id, gameId});
  }
  return ks;
}
