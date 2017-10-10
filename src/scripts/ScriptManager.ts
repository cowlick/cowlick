"use strict";
import {SceneController} from "../components/SceneController";
import {Script} from "../models/Script";

export type ScriptFunction = (scene: SceneController, data: any) => void;

export class ScriptManager {

  private scripts: Map<string, ScriptFunction>;

  constructor(scripts: Map<string, ScriptFunction>) {
    this.scripts = scripts;
  }

  register(name: string, f: ScriptFunction) {
    this.scripts.set(name, f);
  }

  call(controller: SceneController, script: Script<any>) {
    let f = this.scripts.get(script.tag);
    if(f) {
      f(controller, script.data);
    } else {
      controller.game.logger.warn("script not found: " + script.tag);
    }
  }
}
