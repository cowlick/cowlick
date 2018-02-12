import {SaveData} from "cowlick-core";

export interface Snapshot extends SaveData {
  storageKeys: g.StorageReadKey[];
  storageValuesSerialization: g.StorageValueStoreSerialization;
}
