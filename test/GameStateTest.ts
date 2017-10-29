"use strict";
import * as assert from "assert";
import {GameState} from "../src/models/GameState";
import {SaveData} from "../src/models/SaveData";
import {Scene} from "../src/models/Scene";
import {Frame} from "../src/models/Frame";
import {GameError} from "../src/models/GameError";

function assertSaveData(expected: SaveData, actual: string | SaveData) {
  if(typeof actual === "string") {
    assert.fail(actual);
  } else {
    assert.deepEqual(actual, expected);
  }
}

describe("GameState", () => {

  const data: SaveData[] = [
    {
      label: "before",
      frame: 0,
      variables: {}
    }
  ];

  it("セーブデータの存在を確認できる", () => {
    const vars = {
      current: {},
      system: {}
    };
    const state = new GameState(data, vars, 1);
    assert(state.exists(0));
  });

  it("セーブデータが存在しないことを確認できる", () => {
    const vars = {
      current: {},
      system: {}
    };
    const state = new GameState([], vars, 1);
    assert(! state.exists(0));
  });

  it("保存できる", () => {
    const vars = {
      current: {
        test: 0
      },
      system: {}
    };
    const state = new GameState([], vars, 1);
    const scene = new Scene({
      label: "test",
      frames: [
        new Frame([])
      ]
    });
    const expected: SaveData = {
      label: "test",
      frame: 0,
      variables: {
        test: 0
      }
    };
    const actual = state.save(scene, { index: 0 });
    assertSaveData(expected, actual);
  });

  it("description付きで保存できる", () => {
    const vars = {
      current: {
        test: 0
      },
      system: {}
    };
    const state = new GameState([], vars, 1);
    const scene = new Scene({
      label: "test",
      frames: [
        new Frame([])
      ]
    });
    const expected: SaveData = {
      label: "test",
      frame: 0,
      variables: {
        test: 0
      },
      description: "test"
    };
    const actual = state.save(scene, { index: 0, description: "test" });
    assertSaveData(expected, actual);
  });

  it("forceオプションがついている場合は上書きする", () => {
    const vars = {
      current: {
        test: 0
      },
      system: {}
    };
    const state = new GameState(data, vars, 1);
    const scene = new Scene({
      label: "test",
      frames: [
        new Frame([]),
        new Frame([])
      ]
    });
    scene.next();
    const expected: SaveData = {
      label: "test",
      frame: 1,
      variables: {
        test: 0
      }
    };
    const actual = state.save(scene, { index: 0, force: true });
    assertSaveData(expected, actual);
  });

  it("forceオプションがないなら保存に失敗する", () => {
    const vars = {
      current: {
        test: 0
      },
      system: {}
    };
    const state = new GameState(data, vars, 1);
    const scene = new Scene({
      label: "test",
      frames: [
        new Frame([]),
        new Frame([])
      ]
    });
    assert.throws(
      () => {
        scene.next();
        state.save(scene, { index: 0 });
      },
      GameError
    );
  });

  it("値を設定できる", () => {
    const vars = {
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
      type: "current",
      name: "test"
    };
    assert(state.getStringValue(target) === "1");
  });

  it("変数が定義されていない場合はundefinedを返す", () => {
    const vars = {
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
      GameError
    );
  });
});
