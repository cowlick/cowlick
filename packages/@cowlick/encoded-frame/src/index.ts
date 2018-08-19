import * as msgpack5 from "msgpack5";
import {Frame} from "@cowlick/core";

const msgpack = msgpack5();

export class EncodedFrame extends Frame {
  constructor(encoded: string) {
    super(EncodedFrame.decode(encoded));
  }

  private static decode(value: string) {
    return msgpack.decode(Buffer.from(value, "base64"));
  }
}
