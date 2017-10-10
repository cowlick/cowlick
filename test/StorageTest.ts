"use strict";
import * as assert from "assert";
import * as g from "@akashic/akashic-engine";
import * as mock from "./helpers/mock";
import {StorageViewModel as Storage} from "../src/vm/StorageViewModel";
import {GameState} from "../src/models/GameState";

describe("Storage", () => {

  const assets = {
    foo: {
      type: "image",
      path: "/path1.png",
      virtualPath: "path1.png",
      width: 1,
      height: 1
    }
  };

  const game = new mock.Game({
    width: 320,
    height: 320,
    assets
  });

  const data = [
    {
      label: "test",
      frame: 0,
      variables: {
        test: 0
      }
    }
  ];

  it("セーブデータをロードできる", () => {
    const vars = {
      current: {},
      system: {}
    };
    const state = new GameState(data, vars, 1);
    const storage = new Storage(new g.Storage(game), { id: "0" }, state);
    assert(storage.load(0) === data[0]);
    assert(state.variables.current === data[0].variables);
  });
});
