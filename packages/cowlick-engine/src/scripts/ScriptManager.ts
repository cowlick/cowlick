"use strict";
import {Script, Tag, GameError} from "cowlick-core";
import {SceneController} from "../components/SceneController";

/**
 * スクリプトの実態を表す関数
 */
export type ScriptFunction = (controller: SceneController, data: any) => void;

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
    if (f) {
      try {
        f(controller, script.data);
      } catch (e) {
        if (e instanceof GameError) {
          this.call(controller, {tag: Tag.exception, data: e});
        } else {
          throw e;
        }
      }
    } else {
      const data = new GameError("script tag was not registered", script);
      this.call(controller, {tag: Tag.exception, data});
    }
  }
}
