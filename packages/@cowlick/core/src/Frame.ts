import {Script} from "./Script";

/**
 * シーンの1フレームを表す。
 */
export class Frame {
  scripts: Script[];

  constructor(scripts: Script[]) {
    this.scripts = scripts;
  }
}
