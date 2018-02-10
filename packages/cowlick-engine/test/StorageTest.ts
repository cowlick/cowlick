"use strict";
import * as assert from "assert";
import {Storage} from "./helpers/setup";
import {GameState} from "../src/models/GameState";

describe("Storage", () => {
  it("セーブデータをロードできる", () => {
    const variables = {
      current: {},
      system: {},
      builtin: {}
    };
    const data = [
      {
        label: "test",
        variables: {
          test: 0
        },
        logs: [
          {
            frame: 0
          }
        ]
      }
    ];
    const state = new GameState({
      data,
      variables,
      max: 1
    });
    const storage = new Storage(new g.Storage(g.game), {id: "0"}, state);
    assert(storage.load(0) === data[0]);
    assert(state.variables.current === data[0].variables);
  });

  it("descriptionが存在するセーブデータをロードできる", () => {
    const variables = {
      current: {},
      system: {},
      builtin: {}
    };
    const data = [
      {
        label: "test",
        variables: {
          test: 0
        },
        logs: [
          {
            frame: 0
          }
        ],
        description: "test"
      }
    ];
    const state = new GameState({
      data,
      variables,
      max: 1
    });
    const storage = new Storage(new g.Storage(g.game), {id: "0"}, state);
    assert(storage.load(0) === data[0]);
    assert(state.variables.current === data[0].variables);
  });
});
