"use strict";
import * as assert from "assert";
import {Tag} from "@cowlick/core";
import {SceneController} from "../src/components/SceneController";
import {ScriptManager, ScriptFunction} from "../src/scripts/ScriptManager";

function fail(controller: SceneController, data: any) {
  assert.fail("失敗するスクリプトを実行しました");
}

describe("ScriptManager", () => {
  it("登録済みのスクリプトを上書きできる", () => {
    const tag = "test";
    const manager = new ScriptManager(new Map<string, ScriptFunction>([[tag, fail]]));
    manager.register(tag, (controller: SceneController, data: any) => {});
    manager.call(null, {
      tag: Tag.extension,
      data: {
        tag,
        data: null
      }
    });
  });
});
