import {Log} from "./Log";

export interface SaveData {
  label: string;
  variables: any;
  logs: Log[];
  description?: string;
}
