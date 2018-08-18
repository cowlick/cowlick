import * as assert from "assert";
import {AlreadyReadManager} from "../src/models/AlreadyReadManager";

describe("AlreadyReadManager", () => {
  it("既読/未読をチェックできる", () => {
    const manager = new AlreadyReadManager({
      test: [0]
    });
    assert(manager.isAlreadyRead("test", 0));
    assert(!manager.isAlreadyRead("test", 1));
    assert(!manager.isAlreadyRead("other", 0));
  });

  it("既読情報を追加できる", () => {
    const data = {};
    const manager = new AlreadyReadManager(data);
    manager.mark("test", 0);
    assert(manager.isAlreadyRead("test", 0));
  });
});
