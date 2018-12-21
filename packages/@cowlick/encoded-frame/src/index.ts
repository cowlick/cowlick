import * as base64 from "base64-js";
import * as msgpack from "@cowlick/msgpack";
import {Frame} from "@cowlick/core";

export class EncodedFrame extends Frame {
  constructor(encoded: string) {
    super(EncodedFrame.decode(encoded));
  }

  private static decode(value: string) {
    return msgpack.deserialize(base64.toByteArray(value));
  }
}
