"use strict";
import * as assert from "assert";
import {SceneController, ScriptManager, ScriptFunction} from "./helpers/setup";

function fail(controller: SceneController, data: any) {
  assert.fail("失敗するスクリプトを実行しました");
}

describe("ScriptManager", () => {

  it("登録済みのスクリプトを上書きできる", () => {
    const tag = "test";
    const manager = new ScriptManager(new Map<string, ScriptFunction>([
      [tag, fail]
    ]));
    manager.register(tag, (controller: SceneController, data: any) => {});
    manager.call(null, { tag, data: null });
  });
});
