import * as assert from "assert";
import * as fs from "fs";
import * as estree from "estree";
import * as esprima from "esprima";
import {encode} from "../src/encode";

describe("script-encoder-plugin", () => {
  it("FrameをEncodedFrameに変換できる", () => {
    const input = [
      {
        label: "scene0",
        source: esprima.parseModule(fs.readFileSync("test/input.js", "utf8")) as estree.Node
      }
    ];
    const expected = [
      {
        label: "scene0",
        source: esprima.parseModule(fs.readFileSync("test/expected.js", "utf8")) as estree.Node
      }
    ];
    assert.deepEqual(encode(input), expected);
  });
});
