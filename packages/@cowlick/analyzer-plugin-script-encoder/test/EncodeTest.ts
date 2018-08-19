import * as assert from "assert";
import * as fs from "fs";
import * as esprima from "esprima";
import {encodeFrame} from "../src/encode";

describe("script-encoder-plugin", () => {
  it("FrameをEncodedFrameに変換できる", () => {
    const input = esprima.parseModule(fs.readFileSync("test/input.js", "utf8"));
    const expected = esprima.parseModule(fs.readFileSync("test/expected.js", "utf8"));
    assert.deepEqual(encodeFrame(input), expected);
  });
});
