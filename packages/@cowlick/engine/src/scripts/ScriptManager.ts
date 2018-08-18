import {Script, Tag, GameError} from "@cowlick/core";
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

  call(controller: SceneController, script: Script) {
    let f: ScriptFunction | undefined;
    let data: any;
    if (script.tag === Tag.extension) {
      f = this.scripts.get(script.data.tag);
      data = script.data;
    } else {
      f = this.scripts.get(script.tag);
      data = script;
    }
    if (f) {
      try {
        f(controller, data);
      } catch (error) {
        if (error instanceof GameError) {
          this.call(controller, {tag: Tag.exception, error});
        } else {
          throw error;
        }
      }
    } else {
      const error = new GameError("script tag was not registered", script);
      this.call(controller, {tag: Tag.exception, error});
    }
  }
}
