"use strict";
import * as assert from "assert";
import {Scene} from "../src/components/Scene";
import {ScriptManager, ScriptFunction} from "../src/scripts/ScriptManager";

function fail(scene: Scene, data: any) {
  assert.fail("失敗するスクリプトを実行しました");
}

describe("ScriptManager", () => {

  it("登録済みのスクリプトを上書きできる", () => {
    const tag = "test";
    const manager = new ScriptManager(new Map<string, ScriptFunction>([
      [tag, fail]
    ]));
    manager.register(tag, (scene: Scene, data: any) => {});
    manager.call(null, { tag, data: null });
  });
});
