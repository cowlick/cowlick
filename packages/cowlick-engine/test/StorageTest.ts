"use strict";
import * as assert from "assert";
import {Storage, GameState} from "./helpers/setup";

describe("Storage", () => {

  it("セーブデータをロードできる", () => {
    const vars = {
      current: {},
      system: {}
    };
    const data = [
      {
        label: "test",
        frame: 0,
        variables: {
          test: 0
        }
      }
    ];
    const state = new GameState(data, vars, 1);
    const storage = new Storage(new g.Storage(g.game), { id: "0" }, state);
    assert(storage.load(0) === data[0]);
    assert(state.variables.current === data[0].variables);
  });

  it("descriptionが存在するセーブデータをロードできる", () => {
    const vars = {
      current: {},
      system: {}
    };
    const data = [
      {
        label: "test",
        frame: 0,
        variables: {
          test: 0
        },
        description: "test"
      }
    ];
    const state = new GameState(data, vars, 1);
    const storage = new Storage(new g.Storage(g.game), { id: "0" }, state);
    assert(storage.load(0) === data[0]);
    assert(state.variables.current === data[0].variables);
  });
});
