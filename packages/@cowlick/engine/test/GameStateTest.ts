"use strict";
import * as assert from "assert";
import * as core from "@cowlick/core";
import {Snapshot} from "../src/models/Snapshot";
import {GameState} from "../src/models/GameState";

describe("GameState", () => {
  const log: core.Log = {
    frame: 0
  };

  it("セーブデータの存在を確認できる", () => {
    const variables = {
      builtin: {},
      current: {},
      system: {}
    };
    const state = new GameState({
      data: [
        {
          label: "before",
          logs: [log],
          variables: {}
        }
      ],
      variables,
      max: 1,
      scenario: new core.Scenario([])
    });
    assert(state.exists(0));
  });

  it("セーブデータが存在しないことを確認できる", () => {
    const variables = {
      builtin: {},
      current: {},
      system: {}
    };
    const state = new GameState({
      data: [],
      variables,
      max: 1,
      scenario: new core.Scenario([])
    });
    assert(!state.exists(0));
  });

  it("保存できる", () => {
    const variables = {
      builtin: {},
      current: {
        test: 0
      },
      system: {}
    };
    const scenario = new core.Scenario([
      new core.Scene({
        label: "test",
        frames: [new core.Frame([])]
      })
    ]);
    scenario.backlog = [log];
    const state = new GameState({
      data: [],
      variables,
      max: 1,
      scenario
    });
    const expected: core.SaveData = {
      label: "test",
      logs: [log],
      variables: {
        test: 0
      }
    };
    const actual = state.save({index: 0});
    assert.deepEqual(actual, expected);
  });

  it("テキストログはセーブデータに含めない", () => {
    const variables = {
      builtin: {},
      current: {},
      system: {}
    };
    const scenario = new core.Scenario([
      new core.Scene({
        label: "test",
        frames: [new core.Frame([])]
      })
    ]);
    scenario.backlog = [
      {
        frame: 0,
        text: "log"
      }
    ];
    const state = new GameState({
      data: [],
      variables,
      max: 1,
      scenario
    });
    const expected: core.SaveData = {
      label: "test",
      logs: [log],
      variables: {}
    };
    const actual = state.save({index: 0});
    assert.deepEqual(actual, expected);
  });

  it("description付きで保存できる", () => {
    const variables = {
      builtin: {},
      current: {
        test: 0
      },
      system: {}
    };
    const scenario = new core.Scenario([
      new core.Scene({
        label: "test",
        frames: [new core.Frame([])]
      })
    ]);
    scenario.backlog = [log];
    const state = new GameState({
      data: [],
      variables,
      max: 1,
      scenario
    });
    const expected: core.SaveData = {
      label: "test",
      logs: [log],
      variables: {
        test: 0
      },
      description: "test"
    };
    const actual = state.save({index: 0, description: "test"});
    assert.deepEqual(actual, expected);
  });

  it("forceオプションがついている場合は上書きする", () => {
    const variables = {
      builtin: {},
      current: {
        test: 0
      },
      system: {}
    };
    const scenario = new core.Scenario([
      new core.Scene({
        label: "test",
        frames: [new core.Frame([]), new core.Frame([])]
      })
    ]);
    scenario.backlog = [log];
    const state = new GameState({
      data: [
        {
          label: "before",
          logs: [log],
          variables: {}
        }
      ],
      variables,
      max: 1,
      scenario
    });
    scenario.next();
    const expected: core.SaveData = {
      label: "test",
      logs: [
        log,
        {
          frame: 1
        }
      ],
      variables: {
        test: 0
      }
    };
    const actual = state.save({index: 0, force: true});
    assert.deepEqual(actual, expected);
  });

  it("forceオプションがないなら保存に失敗する", () => {
    const variables = {
      builtin: {},
      current: {
        test: 0
      },
      system: {}
    };
    const scenario = new core.Scenario([
      new core.Scene({
        label: "test",
        frames: [new core.Frame([]), new core.Frame([])]
      })
    ]);
    const state = new GameState({
      data: [
        {
          label: "before",
          logs: [log],
          variables: {}
        }
      ],
      variables,
      max: 1,
      scenario
    });
    assert.throws(() => {
      scenario.next();
      state.save({index: 0});
    }, core.GameError);
  });

  it("値を設定できる", () => {
    const variables = {
      builtin: {},
      current: {},
      system: {}
    };
    const state = new GameState({
      data: [],
      variables,
      max: 1,
      scenario: new core.Scenario([])
    });

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
    const variables = {
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
    const state = new GameState({
      data: [],
      variables,
      max: 1,
      scenario: new core.Scenario([])
    });

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
    const variables = {
      builtin: {},
      current: {},
      system: {}
    };
    const state = new GameState({
      data: [],
      variables,
      max: 1,
      scenario: new core.Scenario([])
    });

    let input: any = 1;
    let target = {
      type: "system",
      name: "test"
    };
    assert(state.getValue(target) === undefined);
  });

  it("存在しない変数種別を指定した場合はエラー", () => {
    const variables = {
      builtin: {},
      current: {},
      system: {}
    };
    const state = new GameState({
      data: [],
      variables,
      max: 1,
      scenario: new core.Scenario([])
    });
    const target = {
      type: "other",
      name: "test"
    };
    assert.throws(() => {
      state.getValue(target);
    }, core.GameError);
  });

  it("スナップショットを作成できる", () => {
    const variables: core.Variables = {
      builtin: {},
      current: {
        test: 0
      },
      system: {}
    };
    const scenario = new core.Scenario([
      new core.Scene({
        label: "test",
        frames: [new core.Frame([])]
      })
    ]);
    scenario.backlog = [log];
    const state = new GameState({
      data: [],
      variables,
      max: 1,
      scenario
    });
    const expected: core.SaveData = {
      label: "test",
      logs: [log],
      variables: {
        test: 0
      }
    };
    assert.deepEqual(state.createSnapshot(), expected);
  });
});
