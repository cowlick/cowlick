"use strict";
import * as assert from "assert";
import {core, GameState} from "./helpers/setup";

describe("GameState", () => {

  const data: core.SaveData[] = [
    {
      label: "before",
      frame: 0,
      variables: {}
    }
  ];

  it("セーブデータの存在を確認できる", () => {
    const vars = {
      builtin: {},
      current: {},
      system: {}
    };
    const state = new GameState(data, vars, 1);
    assert(state.exists(0));
  });

  it("セーブデータが存在しないことを確認できる", () => {
    const vars = {
      builtin: {},
      current: {},
      system: {}
    };
    const state = new GameState([], vars, 1);
    assert(! state.exists(0));
  });

  it("保存できる", () => {
    const vars = {
      builtin: {},
      current: {
        test: 0
      },
      system: {}
    };
    const state = new GameState([], vars, 1);
    const scene = new core.Scene({
      label: "test",
      frames: [
        new core.Frame([])
      ]
    });
    const expected: core.SaveData = {
      label: "test",
      frame: 0,
      variables: {
        test: 0
      }
    };
    const actual = state.save(scene, { index: 0 });
    assert.deepEqual(actual, expected);
  });

  it("description付きで保存できる", () => {
    const vars = {
      builtin: {},
      current: {
        test: 0
      },
      system: {}
    };
    const state = new GameState([], vars, 1);
    const scene = new core.Scene({
      label: "test",
      frames: [
        new core.Frame([])
      ]
    });
    const expected: core.SaveData = {
      label: "test",
      frame: 0,
      variables: {
        test: 0
      },
      description: "test"
    };
    const actual = state.save(scene, { index: 0, description: "test" });
    assert.deepEqual(actual, expected);
  });

  it("forceオプションがついている場合は上書きする", () => {
    const vars = {
      builtin: {},
      current: {
        test: 0
      },
      system: {}
    };
    const state = new GameState(data, vars, 1);
    const scene = new core.Scene({
      label: "test",
      frames: [
        new core.Frame([]),
        new core.Frame([])
      ]
    });
    scene.next();
    const expected: core.SaveData = {
      label: "test",
      frame: 1,
      variables: {
        test: 0
      }
    };
    const actual = state.save(scene, { index: 0, force: true });
    assert.deepEqual(actual, expected);
  });

  it("forceオプションがないなら保存に失敗する", () => {
    const vars = {
      builtin: {},
      current: {
        test: 0
      },
      system: {}
    };
    const state = new GameState(data, vars, 1);
    const scene = new core.Scene({
      label: "test",
      frames: [
        new core.Frame([]),
        new core.Frame([])
      ]
    });
    assert.throws(
      () => {
        scene.next();
        state.save(scene, { index: 0 });
      },
      core.GameError
    );
  });

  it("値を設定できる", () => {
    const vars = {
      builtin: {},
      current: {},
      system: {}
    };
    const state = new GameState([], vars, 1);

    let input: any = 1;
    let target = {
      type: "system",
      name: "test"
    };
    state.setValue(target, input);
    assert(state.getValue(target) === input);

    input = false;
    target = {
      type: "builtin",
      name: "autoMode"
    };
    state.setValue(target, input);
    assert(state.getValue(target) === input);

    input = "test";
    target = {
      type: "current",
      name: "test"
    };
    state.setValue(target, input);
    assert(state.getValue(target) === input);
  });

  it("値を文字列で取得できる", () => {
    const vars = {
      builtin: {
        autoMode: true
      },
      current: {
        test: 1
      },
      system: {
        test: "test"
      }
    };
    const state = new GameState([], vars, 1);

    let target = {
      type: "system",
      name: "test"
    };
    assert(state.getStringValue(target) === "test");

    target = {
      type: "builtin",
      name: "autoMode"
    };
    assert(state.getStringValue(target) === "true");

    target = {
      type: "current",
      name: "test"
    };
    assert(state.getStringValue(target) === "1");
  });

  it("変数が定義されていない場合はundefinedを返す", () => {
    const vars = {
      builtin: {},
      current: {},
      system: {}
    };
    const state = new GameState([], vars, 1);

    let input: any = 1;
    let target = {
      type: "system",
      name: "test"
    };
    assert(state.getValue(target) === undefined);
  });

  it("存在しない変数種別を指定した場合はエラー", () => {
    const vars = {
      builtin: {},
      current: {},
      system: {}
    };
    const state = new GameState([], vars, 1);
    const target = {
      type: "other",
      name: "test"
    };
    assert.throws(
      () => {
        state.getValue(target);
      },
      core.GameError
    );
  });
});
