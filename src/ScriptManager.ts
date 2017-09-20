"use strict";
import {Scene} from "./components/Scene";
import {Script} from "./models/Script";

export type ScriptFunction = (scene: Scene, data: any) => void;

export class ScriptManager {

  private scripts: Map<string, ScriptFunction>;

  constructor() {
    this.scripts = new Map<string, ScriptFunction>();
  }

  register(name: string, f: ScriptFunction) {
    this.scripts.set(name, f);
  }

  call(scene: Scene, script: Script) {
    let f = this.scripts.get(script.tag);
    if(f) {
      f(scene, script.data);
    } else {
      scene.game.logger.warn("script not found: " + script.tag);
    }
  }
}
