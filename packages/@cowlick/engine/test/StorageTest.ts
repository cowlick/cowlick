"use strict";
import * as assert from "assert";
import {Scenario} from "@cowlick/core";
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
    const scenario = new Scenario([]);
    const state = new GameState({
      data,
      variables,
      max: 1,
      scenario
    });
    const storage = new Storage({
      storage: new g.Storage(g.game),
      player: {id: "0"},
      state,
      scenario
    });
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
    const scenario = new Scenario([]);
    const state = new GameState({
      data,
      variables,
      max: 1,
      scenario
    });
    const storage = new Storage({
      storage: new g.Storage(g.game),
      player: {id: "0"},
      state,
      scenario
    });
    assert(storage.load(0) === data[0]);
    assert(state.variables.current === data[0].variables);
  });
});
