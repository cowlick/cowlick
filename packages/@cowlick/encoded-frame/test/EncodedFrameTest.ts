import "@xnv/headless-akashic/polyfill";
import * as assert from "assert";
import * as msgpack5 from "msgpack5";
import {Frame, Script, Tag} from "@cowlick/core";
import {EncodedFrame} from "../src/index";

describe("EncodedFrame", () => {
  it("デコード結果がFrameと一致する", () => {
    const scripts: Script[] = [
      {
        tag: Tag.image,
        assetId: "test",
        layer: {
          name: "test"
        }
      },
      {
        tag: Tag.jump,
        label: "test"
      }
    ];
    const expected = new Frame(scripts);
    const msgpack = msgpack5();
    const actual = new EncodedFrame(msgpack.encode(scripts).toString("base64"));
    assert.deepStrictEqual(actual.scripts, expected.scripts);
  });
});
